import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Papa from "papaparse";
import { BIProcedimentoData } from "@opme/types/biProcedimento";

/**
 * Exporta o BI para PDF capturando a seção visual
 */
export const exportBIToPDF = async (
  elementId: string,
  paciente: string,
  procedimento: string
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Elemento não encontrado para exportação");
    }

    // Captura o elemento como imagem
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Adiciona header
    pdf.setFontSize(16);
    pdf.text(`BI do Procedimento - ${procedimento}`, 10, 10);
    pdf.setFontSize(12);
    pdf.text(`Paciente: ${paciente}`, 10, 18);
    pdf.setFontSize(10);
    pdf.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 10, 24);

    position = 30;

    // Adiciona a imagem
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - position;

    // Adiciona páginas extras se necessário
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`BI_${procedimento}_${paciente}_${Date.now()}.pdf`);
  } catch (error) {
    console.error("Erro ao exportar PDF:", error);
    throw new Error("Falha ao exportar PDF");
  }
};

/**
 * Exporta o BI para CSV com duas abas (KPIs e Itens)
 */
export const exportBIToCSV = (biData: BIProcedimentoData): void => {
  try {
    const timestamp = new Date().toLocaleString("pt-BR");
    
    // ABA 1: KPIs e Resumo
    const kpisData = [
      ["BI do Procedimento"],
      [""],
      ["Informações do Paciente"],
      ["Nome", biData.paciente.nome],
      ["Médico", biData.paciente.medico_responsavel],
      ["Convênio", biData.paciente.convenio],
      ["Procedimento", biData.paciente.procedimento_principal],
      ["Especialidade", biData.paciente.especialidade],
      [""],
      ["KPIs do Procedimento"],
      ["Cobertura (%)", biData.kpis_procedimento.cobertura_pct],
      ["Custo Médio (R$)", biData.kpis_procedimento.custo_medio],
      ["Lucro Médio (R$)", biData.kpis_procedimento.lucro_medio],
      ["Total de Glosas", biData.kpis_procedimento.glosas_total],
      ["Taxa de Glosa no Período (%)", biData.kpis_procedimento.taxa_glosa_periodo_pct],
      ["Variação de Custo (%)", biData.kpis_procedimento.variacao_custo_pct],
      ["Variação de Lucro (%)", biData.kpis_procedimento.variacao_lucro_pct],
      [""],
      ["Estatísticas do Médico"],
      ["Taxa de Glosa (%)", biData.medico_stats.glosa_pct],
      ["Custo Médio (R$)", biData.medico_stats.custo_medio],
      ["Variação de Custo (%)", biData.medico_stats.variacao_custo_pct],
      [""],
      ["Gerado em", timestamp],
    ];

    const kpisCSV = Papa.unparse(kpisData);

    // ABA 2: Itens Homologados e Não Homologados
    const itensData = [
      ["Status", "Item", "Quantidade"],
      ...biData.listas_itens.homologados.map((item) => [
        "Homologado",
        item.nome,
        item.quantidade,
      ]),
      ...biData.listas_itens.nao_homologados.map((item) => [
        "Não Homologado",
        item.nome,
        item.quantidade,
      ]),
    ];

    const itensCSV = Papa.unparse(itensData);

    // Criar arquivo combinado (simulação de múltiplas abas via comentários)
    const combinedCSV = `# ABA 1: KPIs e Resumo\n${kpisCSV}\n\n# ABA 2: Itens\n${itensCSV}`;

    // Download
    const blob = new Blob([combinedCSV], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `BI_${biData.paciente.procedimento_principal}_${biData.paciente.nome}_${Date.now()}.csv`
    );
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Erro ao exportar CSV:", error);
    throw new Error("Falha ao exportar CSV");
  }
};
