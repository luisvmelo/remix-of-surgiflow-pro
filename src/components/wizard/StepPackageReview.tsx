import { useNavigate } from "react-router-dom";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, TrendingUp, AlertTriangle, Shield, User, Stethoscope,
  Building, FileText, Package, Send, ClipboardList, RotateCcw,
  ShieldCheck, Edit3, Clock, History, ArrowLeft
} from "lucide-react";
import { mockLinkedProcedures, mockExtractedItems, mockDocuments, mockRecommendedOPMEs } from "@/lib/mockData";
import { cn } from "@/lib/utils";

// Simulated historical package for the selected procedure
const getHistoricalPackage = (procedureCode: string | undefined) => {
  // Mock: based on last 5 surgeries of this type
  const procedures = [
    { code: "30725020", name: "Condroplastia artroscópica", delta: "+R$ 820" },
    { code: "31003079", name: "Bloqueio anestésico regional", delta: "+R$ 420" },
  ];

  const items = [
    { id: "h1", name: "Placa de Titânio 3.5mm", supplier: "Synthes", quantity: 2, type: "OPME" as const },
    { id: "h2", name: "Parafuso Cortical 3.5x40mm", supplier: "Synthes", quantity: 8, type: "OPME" as const },
    { id: "h3", name: "Parafuso Bloqueado 3.5x30mm", supplier: "Synthes", quantity: 4, type: "OPME" as const },
    { id: "h4", name: "Kit de Instrumental Ortopédico", supplier: "Synthes", quantity: 1, type: "Material" as const },
    { id: "h5", name: "Fio de Sutura Vicryl 2-0", supplier: "Ethicon", quantity: 3, type: "Material" as const },
    { id: "h6", name: "Âncora de Sutura 5.5mm", supplier: "Arthrex", quantity: 2, type: "OPME" as const },
    { id: "h7", name: "Lâmina de Shaver 5.5mm", supplier: "Smith & Nephew", quantity: 2, type: "Material" as const },
    { id: "h8", name: "Dreno Portovac 3.2mm", supplier: "BBraun", quantity: 1, type: "Material" as const },
  ];

  const documents = [
    { name: "Guia TISS preenchida", attached: true },
    { name: "Relatório médico detalhado", attached: true },
    { name: "Exames de imagem (RX/TC/RM)", attached: true },
    { name: "Exames pré-operatórios", attached: true },
    { name: "Termo de consentimento", attached: true },
    { name: "Cotação de OPME (3 fornecedores)", attached: true },
  ];

  return {
    procedures,
    items,
    documents,
    rentability: 16,
    glossRisk: 8,
    conformidade: 100,
    basedOn: 5,
    lastDate: "12 fev 2026",
  };
};

const StepPackageReview = () => {
  const { state, updateState, setStep, saveRequest, resetWizard } = useSurgical();
  const navigate = useNavigate();

  const pkg = getHistoricalPackage(state.selectedProcedure?.code);

  const rentColor = pkg.rentability > 15 ? "text-success" : pkg.rentability > 0 ? "text-warning" : "text-destructive";
  const glossColor = pkg.glossRisk < 15 ? "text-success" : pkg.glossRisk < 30 ? "text-warning" : "text-destructive";

  const handleConfirm = () => {
    // Pre-fill state with package data and send
    updateState({
      extractedItems: pkg.items.map((item, i) => ({
        ...item,
        uncertain: false,
        status: "ok" as const,
      })),
      linkedProcedures: pkg.procedures.map(p => p.code),
      documents: mockDocuments.map(d => ({
        ...d,
        attached: pkg.documents.some(pd => pd.name === d.name && pd.attached),
      })),
      rentabilityScore: pkg.rentability,
      glossRisk: pkg.glossRisk,
      showPackageReview: false,
    });
    saveRequest("awaiting-auth");
    resetWizard();
    navigate("/medico");
  };

  const handleBack = () => {
    updateState({
      showPackageReview: false,
      currentStep: 1,
    });
    setStep(1);
  };

  const handleEdit = () => {
    // Pre-fill state with package data and go to wizard step 2
    updateState({
      extractedItems: pkg.items.map((item) => ({
        ...item,
        uncertain: false,
        status: "ok" as const,
      })),
      linkedProcedures: pkg.procedures.map(p => p.code),
      documents: mockDocuments.map(d => ({
        ...d,
        attached: pkg.documents.some(pd => pd.name === d.name && pd.attached),
      })),
      rentabilityScore: pkg.rentability,
      glossRisk: pkg.glossRisk,
      showPackageReview: false,
      currentStep: 2,
    });
    setStep(2);
  };

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8 space-y-5 max-w-[1200px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="p-2 rounded-xl bg-primary/10">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Pacote Sugerido</h2>
            <p className="text-muted-foreground text-xs">
              Baseado nas últimas {pkg.basedOn} cirurgias de{" "}
              <span className="font-semibold text-foreground">{state.selectedProcedure?.name}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          Última realizada em {pkg.lastDate}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <TrendingUp className={cn("w-5 h-5 mx-auto mb-1", rentColor)} />
          <div className={cn("text-3xl font-extrabold tracking-tight", rentColor)}>+{pkg.rentability}%</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Rentabilidade Média</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <AlertTriangle className={cn("w-5 h-5 mx-auto mb-1", glossColor)} />
          <div className={cn("text-3xl font-extrabold tracking-tight", glossColor)}>{pkg.glossRisk}%</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Risco de Glosa</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Shield className={cn("w-5 h-5 mx-auto mb-1", pkg.conformidade === 100 ? "text-success" : "text-warning")} />
          <div className={cn("text-3xl font-extrabold tracking-tight", pkg.conformidade === 100 ? "text-success" : "text-warning")}>{pkg.conformidade}%</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Conformidade</div>
        </div>
      </div>

      {/* Guide content */}
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Patient / Doctor / Operadora header */}
        <div className="bg-muted/30 border-b px-5 py-3">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
                <User className="w-3 h-3" /> Paciente
              </div>
              <div className="font-semibold text-foreground">{state.patient?.name || "—"}</div>
              <div className="text-muted-foreground mt-0.5">CPF: {state.patient?.cpf || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
                <Stethoscope className="w-3 h-3" /> Médico
              </div>
              <div className="font-semibold text-foreground">{state.doctor?.name || "—"}</div>
              <div className="text-muted-foreground mt-0.5">{state.doctor?.specialty} · {state.doctor?.crm}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
                <Building className="w-3 h-3" /> Operadora
              </div>
              <div className="font-semibold text-foreground">{state.operadora?.name || "—"}</div>
            </div>
          </div>
        </div>

        {/* Procedures */}
        <div className="px-5 py-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Procedimentos ({1 + pkg.procedures.length})
            </span>
          </div>
          {/* Principal */}
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/5 border border-primary/20 mb-1.5">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-semibold text-foreground">{state.selectedProcedure?.name || "—"}</span>
              <span className="text-muted-foreground font-mono">{state.selectedProcedure?.code}</span>
            </div>
            <span className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10">Principal</span>
          </div>
          {/* Secondary from package */}
          {pkg.procedures.map((proc) => (
            <div key={proc.code} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 mb-1 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                <span className="text-foreground">{proc.name}</span>
                <span className="text-muted-foreground font-mono">{proc.code}</span>
              </div>
              <span className="font-bold tabular-nums text-success">{proc.delta}</span>
            </div>
          ))}
        </div>

        {/* Items OPME */}
        <div className="px-5 py-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Itens OPME & Materiais ({pkg.items.length})
            </span>
          </div>
          <div className="space-y-1">
            {pkg.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                  <span className="font-medium text-foreground truncate">{item.name}</span>
                  <span className="text-muted-foreground shrink-0">· {item.supplier}</span>
                </div>
                <span className="text-muted-foreground tabular-nums shrink-0 ml-2">×{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Documentos ({pkg.documents.filter(d => d.attached).length})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {pkg.documents.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-success/5 text-xs">
                <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                <span className="text-foreground">{doc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2 pb-4">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 gap-2 min-w-0"
          onClick={handleEdit}
        >
          <Edit3 className="w-4 h-4 shrink-0" />
          <span className="truncate">Editar Guia</span>
        </Button>
        <Button
          size="lg"
          className="flex-1 gap-2 min-w-0"
          onClick={handleConfirm}
        >
          <Send className="w-4 h-4 shrink-0" />
          <span className="truncate">Confirmar e Enviar</span>
        </Button>
      </div>
    </div>
  );
};

export default StepPackageReview;
