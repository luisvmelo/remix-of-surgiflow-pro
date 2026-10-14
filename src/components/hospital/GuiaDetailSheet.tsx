import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FaixaBadge } from "@/components/hospital/HonorarioTags";
import { useSurgical } from "@/contexts/SurgicalContext";
import { calcularGuiaMock, operadoraNome, type GuiaMock } from "@/lib/guias";
import { mockLinkedProcedures } from "@/lib/mockData";
import {
  brl, brlDelta, complementarItem, equivalencias, ganhoItem, ganhoProcedimentoVinculado,
  honorarioVinculado, infoMatMed,
} from "@/lib/remuneracao";
import { cn } from "@/lib/utils";
import { ArrowRight, Building2, Stethoscope } from "lucide-react";
import SplitBar from "./SplitBar";

const GuiaDetailSheet = ({ guia, onClose }: { guia: GuiaMock | null; onClose: () => void }) => {
  const { hospitalConfig } = useSurgical();

  return (
    <Sheet open={!!guia} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {guia && <Detail guia={guia} config={hospitalConfig} />}
      </SheetContent>
    </Sheet>
  );
};

const Detail = ({ guia, config }: { guia: GuiaMock; config: ReturnType<typeof useSurgical>["hospitalConfig"] }) => {
  const c = calcularGuiaMock(guia, config);

  // Alternativas por equivalente técnico: efeito para os dois lados.
  const trocas = guia.itens.flatMap((item) => {
    const eq = equivalencias.find((e) => e.original === item.name || e.alternativa === item.name);
    if (!eq) return [];
    const alternativa = eq.original === item.name ? eq.alternativa : eq.original;
    const hospitalAtual = ganhoItem(item.name, item.quantity) - complementarItem(item.name, item.quantity, config);
    const hospitalAlt = ganhoItem(alternativa, item.quantity) - complementarItem(alternativa, item.quantity, config);
    return [{
      de: item.name,
      para: alternativa,
      hospital: hospitalAlt - hospitalAtual,
      medico: complementarItem(alternativa, item.quantity, config) - complementarItem(item.name, item.quantity, config),
    }];
  });

  return (
    <>
      <SheetHeader className="text-left">
        <SheetTitle className="text-base leading-tight">{guia.procedure}</SheetTitle>
        <p className="text-xs text-muted-foreground">
          {guia.patient} · {operadoraNome(guia.operadoraId)} {guia.nivel} · {guia.doctor}
        </p>
      </SheetHeader>

      {/* Resumo dos dois lados */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="rounded-xl border-2 border-info/30 bg-info/5 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-info uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" /> Hospital
          </div>
          <div className="text-xl font-extrabold text-foreground tabular-nums mt-1">{brl(c.margemHospital)}</div>
          <div className="text-[11px] text-muted-foreground">
            Ganho bruto {brl(c.ganhoBrutoHospital)} − complementar {brl(c.honorarioComplementar)}
          </div>
        </div>
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5" /> Médico
          </div>
          <div className="text-xl font-extrabold text-foreground tabular-nums mt-1">{brl(c.honorarioTotal)}</div>
          <div className="text-[11px] text-muted-foreground">
            Base {brl(c.honorarioBase)} + complementar {brl(c.honorarioComplementar)}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Divisão do ganho gerado pelas escolhas
        </div>
        <SplitBar hospital={Math.max(0, c.margemHospital)} medico={c.honorarioComplementar} />
      </div>

      {/* Procedimentos */}
      <div className="mt-6">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Procedimentos</div>
        <div className="rounded-lg border divide-y text-xs">
          <div className="grid grid-cols-[1fr_90px_90px] px-3 py-2 bg-muted/40 font-semibold text-[10px] text-muted-foreground uppercase">
            <span>Procedimento</span><span className="text-right">Hospital</span><span className="text-right">Honorário</span>
          </div>
          <div className="grid grid-cols-[1fr_90px_90px] px-3 py-2">
            <span className="font-medium text-foreground">{guia.procedure} <span className="text-[10px] text-primary">(principal)</span></span>
            <span className="text-right text-muted-foreground">—</span>
            <span className="text-right tabular-nums font-semibold">{brl(c.honorarioPrincipal)}</span>
          </div>
          {guia.vinculados.map((code) => (
            <div key={code} className="grid grid-cols-[1fr_90px_90px] px-3 py-2">
              <span className="text-foreground">{mockLinkedProcedures.find((p) => p.code === code)?.name || code}</span>
              <span className={cn("text-right tabular-nums", ganhoProcedimentoVinculado(code) >= 0 ? "text-info" : "text-destructive")}>
                {brlDelta(ganhoProcedimentoVinculado(code))}
              </span>
              <span className="text-right tabular-nums">{brl(honorarioVinculado(code, guia.operadoraId, guia.nivel))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Itens */}
      <div className="mt-5">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Itens OPME / MatMed</div>
        <div className="rounded-lg border divide-y text-xs">
          <div className="grid grid-cols-[1fr_44px_80px_80px] px-3 py-2 bg-muted/40 font-semibold text-[10px] text-muted-foreground uppercase">
            <span>Item</span><span className="text-center">Faixa</span><span className="text-right">Hospital</span><span className="text-right">Médico</span>
          </div>
          {guia.itens.map((item) => {
            const comp = complementarItem(item.name, item.quantity, config);
            const hosp = ganhoItem(item.name, item.quantity) - comp;
            return (
              <div key={item.name} className="grid grid-cols-[1fr_44px_80px_80px] px-3 py-2 items-center">
                <span className="text-foreground">{item.name} <span className="text-muted-foreground">×{item.quantity}</span></span>
                <span className="text-center"><FaixaBadge faixa={infoMatMed(item.name)?.faixa} /></span>
                <span className={cn("text-right tabular-nums", hosp >= 0 ? "text-info" : "text-destructive")}>{brlDelta(hosp)}</span>
                <span className={cn("text-right tabular-nums", comp > 0 ? "text-primary font-semibold" : "text-muted-foreground")}>
                  {comp > 0 ? brlDelta(comp) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alternativas */}
      {trocas.length > 0 && (
        <div className="mt-5">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Se trocasse por equivalente técnico
          </div>
          <div className="space-y-2">
            {trocas.map((t) => (
              <div key={t.de} className="rounded-lg border p-3 text-xs">
                <div className="flex items-center gap-1.5 text-foreground">
                  <span className="truncate">{t.de}</span>
                  <ArrowRight className="w-3 h-3 shrink-0 text-muted-foreground" />
                  <span className="font-semibold truncate">{t.para}</span>
                </div>
                <div className="flex gap-4 mt-1.5 tabular-nums">
                  <span>Hospital <strong className={t.hospital >= 0 ? "text-info" : "text-destructive"}>{brlDelta(t.hospital)}</strong></span>
                  <span>Médico <strong className={t.medico >= 0 ? "text-primary" : "text-destructive"}>{brlDelta(t.medico)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default GuiaDetailSheet;
