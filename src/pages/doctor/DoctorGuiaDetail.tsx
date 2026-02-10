import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, User, Building, Calendar, Package, FileText,
  CheckCircle2, XCircle, AlertTriangle, TrendingUp, Shield,
  Lightbulb, ShieldCheck, ShieldAlert, Stethoscope, Send,
  MessageSquare, Edit3, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock full guide data
const mockGuides: Record<string, any> = {
  d1: {
    patient: "João Carlos Silva", cpf: "123.456.789-00", operadora: "Unimed",
    procedure: "Artroscopia de Joelho — Meniscectomia", code: "30725119",
    date: "2026-02-18", secretary: "Camila Souza",
    rentability: 12, glossRisk: 8, conformidade: 100,
    procedures: [
      { name: "Artroscopia de Joelho — Meniscectomia", code: "30725119", type: "principal" },
      { name: "Condroplastia artroscópica", code: "30725020", delta: "+R$ 820" },
      { name: "Bloqueio anestésico regional", code: "31003079", delta: "+R$ 420" },
    ],
    items: [
      { name: "Placa LCP 3.5mm Distal Radius", supplier: "Synthes", qty: 2, status: "ok" },
      { name: "Parafuso Bloqueado 3.5x28mm", supplier: "Synthes", qty: 8, status: "ok" },
      { name: "Cânula Artroscópica 7mm", supplier: "Smith & Nephew", qty: 1, status: "ok" },
      { name: "K-Wire 1.6mm", supplier: "Synthes", qty: 2, status: "ok" },
      { name: "Fio de Alta Resistência #2", supplier: "Arthrex", qty: 3, status: "ok" },
    ],
    documents: [
      { name: "Guia TISS preenchida", attached: true },
      { name: "Relatório médico detalhado", attached: true },
      { name: "Exames de imagem (RX/TC/RM)", attached: true },
      { name: "Exames pré-operatórios", attached: true },
    ],
    suggestions: [
      { text: "Todos os itens conferidos — sem ofensores", type: "success" as const },
      { text: "Documentação completa — 100% conformidade", type: "success" as const },
    ],
  },
  d2: {
    patient: "Ana Paula Ferreira", cpf: "987.654.321-00", operadora: "Bradesco Saúde",
    procedure: "Reconstrução de LCA", code: "30725097",
    date: "2026-02-25", secretary: "Camila Souza",
    rentability: 6, glossRisk: 22, conformidade: 75,
    procedures: [
      { name: "Reconstrução de LCA", code: "30725097", type: "principal" },
      { name: "Sinovectomia parcial", code: "30715024", delta: "+R$ 350" },
    ],
    items: [
      { name: "Implante Interferencial Titânio 7x23", supplier: "Arthrex", qty: 1, status: "offender" },
      { name: "Âncora Bio-Compósita 5.5mm", supplier: "Arthrex", qty: 2, status: "offender" },
      { name: "Parafuso Bloqueado 3.5x28mm", supplier: "Synthes", qty: 6, status: "ok" },
      { name: "Fio de Alta Resistência #2", supplier: "Arthrex", qty: 4, status: "ok" },
    ],
    documents: [
      { name: "Guia TISS preenchida", attached: true },
      { name: "Relatório médico detalhado", attached: true },
      { name: "Exames de imagem (RX/TC/RM)", attached: false },
      { name: "Exames pré-operatórios", attached: false },
    ],
    suggestions: [
      { text: "Substituir Implante Interferencial Titânio por PEEK — economia de R$ 520 e menor risco de glosa", type: "warning" as const },
      { text: "Âncora Bio-Compósita é ofensor nesta operadora — considere Âncora PEEK 5.5mm", type: "warning" as const },
      { text: "Faltam 2 documentos obrigatórios para envio", type: "error" as const },
    ],
  },
  d3: {
    patient: "Mariana Souza Lima", cpf: "321.654.987-00", operadora: "Unimed",
    procedure: "Artroscopia de Ombro — Reparo do manguito", code: "30725038",
    date: "2026-03-12", secretary: "Roberta Lima",
    rentability: 18, glossRisk: 5, conformidade: 100,
    procedures: [
      { name: "Artroscopia de Ombro — Reparo do manguito", code: "30725038", type: "principal" },
      { name: "Condroplastia artroscópica", code: "30725020", delta: "+R$ 820" },
      { name: "Liberação de retináculo lateral", code: "30725052", delta: "+R$ 180" },
    ],
    items: [
      { name: "Cânula Artroscópica 7mm", supplier: "Smith & Nephew", qty: 2, status: "ok" },
      { name: "Lâmina Shaver Agressiva", supplier: "Smith & Nephew", qty: 1, status: "glosa" },
      { name: "Fio de Alta Resistência #2", supplier: "Arthrex", qty: 6, status: "ok" },
    ],
    documents: [
      { name: "Guia TISS preenchida", attached: true },
      { name: "Relatório médico detalhado", attached: true },
      { name: "Exames de imagem (RX/TC/RM)", attached: true },
      { name: "Exames pré-operatórios", attached: true },
    ],
    suggestions: [
      { text: "Excelente rentabilidade — acima do percentil 85", type: "success" as const },
      { text: "Lâmina Shaver tem risco de glosa leve — monitorar", type: "info" as const },
    ],
  },
};

// Fallback for approved items
["d4", "d5"].forEach((id) => {
  mockGuides[id] = {
    ...mockGuides.d1,
    patient: id === "d4" ? "Carlos Eduardo Martins" : "Roberto Nascimento",
    procedure: id === "d4" ? "Tratamento cirúrgico de fratura de punho" : "Osteossíntese de platô tibial",
    code: id === "d4" ? "30715016" : "30725080",
    rentability: id === "d4" ? 15 : 21,
    glossRisk: id === "d4" ? 4 : 3,
    conformidade: 100,
    suggestions: [{ text: "Guia aprovada — pronta para envio", type: "success" as const }],
  };
});

const statusStyles: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  ok: { icon: CheckCircle2, color: "text-success" },
  offender: { icon: ShieldAlert, color: "text-destructive" },
  glosa: { icon: AlertTriangle, color: "text-warning" },
};

const DoctorGuiaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const guide = mockGuides[id || ""] || mockGuides.d1;
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("procedures");
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);

  const rentColor = guide.rentability > 15 ? "text-success" : guide.rentability > 0 ? "text-warning" : "text-destructive";
  const glossColor = guide.glossRisk < 15 ? "text-success" : guide.glossRisk < 30 ? "text-warning" : "text-destructive";

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (approved || rejected) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4",
          approved ? "bg-success/15" : "bg-destructive/15"
        )}>
          {approved ? <CheckCircle2 className="w-8 h-8 text-success" /> : <XCircle className="w-8 h-8 text-destructive" />}
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          {approved ? "Guia Aprovada" : "Guia Devolvida"}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {approved ? "A secretária será notificada para envio." : "A secretária receberá seu feedback para correção."}
        </p>
        <Button onClick={() => navigate("/medico")} className="w-full max-w-xs">
          Voltar ao início
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b px-4 pt-10 pb-3 safe-area-top sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/medico")} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground text-sm truncate">{guide.procedure}</h1>
            <p className="text-[10px] text-muted-foreground font-mono">{guide.code}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Big numbers */}
        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          <div className="glass-card rounded-xl p-3 text-center">
            <TrendingUp className={cn("w-4 h-4 mx-auto mb-0.5", rentColor)} />
            <div className={cn("text-xl font-extrabold", rentColor)}>+{guide.rentability}%</div>
            <div className="text-[9px] text-muted-foreground">Rentabilidade</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <AlertTriangle className={cn("w-4 h-4 mx-auto mb-0.5", glossColor)} />
            <div className={cn("text-xl font-extrabold", glossColor)}>{guide.glossRisk}%</div>
            <div className="text-[9px] text-muted-foreground">Risco Glosa</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <Shield className={cn("w-4 h-4 mx-auto mb-0.5", guide.conformidade === 100 ? "text-success" : "text-warning")} />
            <div className={cn("text-xl font-extrabold", guide.conformidade === 100 ? "text-success" : "text-warning")}>{guide.conformidade}%</div>
            <div className="text-[9px] text-muted-foreground">Conformidade</div>
          </div>
        </div>

        {/* Patient info */}
        <div className="px-4 pb-3">
          <div className="glass-card rounded-xl p-3">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground font-medium">{guide.patient}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground">{guide.operadora}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground">{new Date(guide.date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Stethoscope className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground text-[10px]">{guide.secretary}</span>
              </div>
            </div>
          </div>
        </div>

        {/* System suggestions */}
        {guide.suggestions.length > 0 && (
          <div className="px-4 pb-3">
            <div className={cn(
              "rounded-xl p-3 border",
              guide.suggestions.some((s: any) => s.type === "error") ? "bg-destructive/5 border-destructive/20" :
              guide.suggestions.some((s: any) => s.type === "warning") ? "bg-warning/5 border-warning/20" :
              "bg-success/5 border-success/20"
            )}>
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-accent" />
                <span className="text-[11px] font-bold text-foreground">Análise do Sistema</span>
              </div>
              <div className="space-y-1.5">
                {guide.suggestions.map((s: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    {s.type === "success" && <CheckCircle2 className="w-3 h-3 text-success shrink-0 mt-0.5" />}
                    {s.type === "warning" && <AlertTriangle className="w-3 h-3 text-warning shrink-0 mt-0.5" />}
                    {s.type === "error" && <XCircle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />}
                    {s.type === "info" && <Lightbulb className="w-3 h-3 text-primary shrink-0 mt-0.5" />}
                    <span className="text-foreground">{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Collapsible sections */}
        <div className="px-4 space-y-2 pb-4">
          {/* Procedures */}
          <div className="glass-card rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection("procedures")}
              className="w-full flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Procedimentos ({guide.procedures.length})</span>
              </div>
              {expandedSection === "procedures" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {expandedSection === "procedures" && (
              <div className="px-3 pb-3 space-y-1.5">
                {guide.procedures.map((p: any, idx: number) => (
                  <div key={idx} className={cn(
                    "flex items-center justify-between py-2 px-2.5 rounded-lg text-[11px]",
                    p.type === "principal" ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
                  )}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CheckCircle2 className={cn("w-3 h-3 shrink-0", p.type === "principal" ? "text-primary" : "text-success")} />
                      <span className="text-foreground truncate">{p.name}</span>
                    </div>
                    {p.delta && <span className="text-success font-bold shrink-0 ml-2">{p.delta}</span>}
                    {p.type === "principal" && <span className="text-[9px] text-primary font-semibold shrink-0 ml-2">Principal</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="glass-card rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection("items")}
              className="w-full flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Itens OPME ({guide.items.length})</span>
              </div>
              {expandedSection === "items" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {expandedSection === "items" && (
              <div className="px-3 pb-3 space-y-1.5">
                {guide.items.map((item: any, idx: number) => {
                  const style = statusStyles[item.status] || statusStyles.ok;
                  const Icon = style.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between py-2 px-2.5 rounded-lg bg-muted/30 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Icon className={cn("w-3 h-3 shrink-0", style.color)} />
                        <span className="text-foreground truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-muted-foreground">×{item.qty}</span>
                        {item.status === "offender" && (
                          <span className="badge-danger text-[8px] px-1 py-0.5 rounded-full">Ofensor</span>
                        )}
                        {item.status === "glosa" && (
                          <span className="badge-warning text-[8px] px-1 py-0.5 rounded-full">Glosa</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="glass-card rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection("docs")}
              className="w-full flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Documentos</span>
              </div>
              {expandedSection === "docs" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {expandedSection === "docs" && (
              <div className="px-3 pb-3 space-y-1.5">
                {guide.documents.map((doc: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-muted/30 text-[11px]">
                    {doc.attached ? (
                      <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 text-destructive shrink-0" />
                    )}
                    <span className={cn("text-foreground", !doc.attached && "text-destructive")}>{doc.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="border-t bg-card px-4 py-3 safe-area-bottom space-y-2">
        {/* Comment toggle */}
        <button
          onClick={() => setShowComment(!showComment)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {showComment ? "Ocultar comentário" : "Adicionar comentário (opcional)"}
        </button>

        {showComment && (
          <Textarea
            placeholder="Observações ou ajustes necessários..."
            className="text-sm min-h-[60px]"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 text-sm font-semibold border-destructive/30 text-destructive hover:bg-destructive/5"
            onClick={() => setRejected(true)}
          >
            <XCircle className="w-4 h-4 mr-1.5" /> Devolver
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 text-sm font-semibold"
            onClick={() => navigate(`/medico/guia/${id}/editar`)}
          >
            <Edit3 className="w-4 h-4 mr-1.5" /> Editar
          </Button>
          <Button
            className="flex-1 h-12 text-sm font-semibold"
            onClick={() => setApproved(true)}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Aprovar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorGuiaDetail;
