import { describe, it, expect } from "vitest";
import { DOMINIO_SEMENTE } from "@/dominio/dados";
import { leque, avaliarPedido, pedidoSugerido, compraRapida, previsaoMedico } from "@/dominio/motor";
import type { Pedido } from "@/dominio/tipos";

const D = DOMINIO_SEMENTE;
const SULAMERICA = "4"; // pacote
const UNIMED = "1"; // conta aberta
const HAPVIDA = "6";

const base = (parcial: Partial<Pedido>): Pedido => ({
  id: "t",
  medicoId: "1",
  paciente: { nome: "Teste", cpf: "000.000.000-00" },
  operadoraId: SULAMERICA,
  plano: "Especial",
  procedimentoId: "artrodese-lombar",
  codigos: [],
  itens: [],
  documentos: [],
  status: "rascunho",
  ajustes: [],
  urgencia: false,
  criadoEm: "2026-10-01",
  dataCirurgia: "2026-11-10",
  ...parcial,
});

const sugerido = (procedimentoId: string, operadoraId: string, extra: Partial<Pedido> = {}) => {
  const s = pedidoSugerido(procedimentoId, operadoraId, D);
  const protocolo = D.padroes[procedimentoId].protocolo;
  return base({ procedimentoId, operadoraId, codigos: s.codigos, itens: s.itens, documentos: [...protocolo.documentos], ...extra });
};

describe("leque()", () => {
  it("só deixa no leque as marcas homologadas na operadora e avisa quando ficam menos de 3", () => {
    const l = leque(D.padroes["artrodese-lombar"], HAPVIDA, D);
    const parafuso = l.find((i) => i.itemId === "parafuso-pedicular")!;
    expect(parafuso.aceitas.every((m) => m.homologadaEm.includes(HAPVIDA))).toBe(true);
    expect(parafuso.naoHomologadas.length).toBeGreaterThan(0);
    expect(parafuso.avisoMinimo).toBe(parafuso.aceitas.length < 3);
  });

  it("na SulAmérica o parafuso tem pelo menos 3 marcas aceitas, sem aviso", () => {
    const parafuso = leque(D.padroes["artrodese-lombar"], SULAMERICA, D).find((i) => i.itemId === "parafuso-pedicular")!;
    expect(parafuso.aceitas.length).toBeGreaterThanOrEqual(3);
    expect(parafuso.avisoMinimo).toBe(false);
  });
});

describe("avaliarPedido()", () => {
  it("pedido sugerido completo: tudo conforme, honorário e complemento garantidos", () => {
    const a = avaliarPedido(sugerido("artrodese-lombar", SULAMERICA), D);
    expect(a.completo).toBe(true);
    expect(a.checklist.every((c) => c.ok)).toBe(true);
    expect(a.honorario.garantido).toBe(true);
    expect(a.honorario.valor).toBeGreaterThan(0);
    expect(a.complemento.total).toBeGreaterThan(0);
    expect(a.complemento.garantido).toBe(a.complemento.total);
    expect(a.complemento.perdido).toBe(0);
  });

  it("marca não homologada na operadora: sinaliza, tira a garantia do honorário e perde complemento", () => {
    const p = sugerido("artrodese-lombar", HAPVIDA);
    const naoHomologada = D.marcas.find((m) => m.itemId === "parafuso-pedicular" && !m.homologadaEm.includes(HAPVIDA))!;
    p.itens = p.itens.map((i) => (i.itemId === "parafuso-pedicular" ? { ...i, marcaId: naoHomologada.id } : i));
    const a = avaliarPedido(p, D);
    expect(a.naoHomologados).toContain(naoHomologada.id);
    expect(a.honorario.garantido).toBe(false);
    expect(a.complemento.perdido).toBeGreaterThan(0);
  });

  it("item que o protocolo não prevê aparece como fora do protocolo", () => {
    const p = sugerido("artrodese-lombar", SULAMERICA);
    const estranho = D.marcas.find((m) => m.itemId === "lamina-shaver")!;
    p.itens = [...p.itens, { itemId: "lamina-shaver", marcaId: estranho.id, qtd: 1 }];
    const a = avaliarPedido(p, D);
    expect(a.foraProtocolo).toContain("lamina-shaver");
    expect(a.honorario.garantido).toBe(false);
  });

  it("pacote: o consumo do teto é custo hospitalar + OPME + complemento", () => {
    const a = avaliarPedido(sugerido("artrodese-lombar", SULAMERICA), D);
    const contrato = D.contratosOperadora.find((c) => c.operadoraId === SULAMERICA && c.procedimentoId === "artrodese-lombar")!;
    expect(a.hospital.tipo).toBe("pacote");
    expect(contrato.tipo).toBe("pacote");
    if (contrato.tipo !== "pacote") return;
    expect(a.hospital.consumoTeto).toBe(contrato.custoHospitalar + a.hospital.custoOpme + a.complemento.garantido);
    expect(a.hospital.margem).toBe(contrato.teto - a.hospital.consumoTeto!);
  });

  it("conta aberta: a margem é a soma de (tabela − custo) × quantidade, menos o complemento", () => {
    const p = sugerido("artroscopia-joelho", UNIMED);
    const a = avaliarPedido(p, D);
    const contrato = D.contratosOperadora.find((c) => c.operadoraId === UNIMED && c.procedimentoId === "artroscopia-joelho")!;
    expect(contrato.tipo).toBe("aberta");
    if (contrato.tipo !== "aberta") return;
    const bruto = p.itens.reduce((acc, i) => {
      const marca = D.marcas.find((m) => m.id === i.marcaId)!;
      return acc + (contrato.tabelaItem[i.itemId] - marca.custo) * i.qtd;
    }, 0);
    expect(a.hospital.margem).toBe(Math.round(bruto - a.complemento.garantido));
  });

  it("médico que não participa do complemento recebe 0, com o motivo", () => {
    const a = avaliarPedido(sugerido("histerectomia", SULAMERICA, { medicoId: "2" }), D);
    expect(a.complemento.total).toBe(0);
    expect(a.complemento.motivo).toMatch(/não participa/i);
  });

  it("pedido ainda sem itens não garante complemento nem honorário", () => {
    const a = avaliarPedido(base({ procedimentoId: "artrodese-lombar" }), D);
    expect(a.complemento.garantido).toBe(0);
    expect(a.honorario.garantido).toBe(false);
  });

  it("pedido sem procedimento não quebra e volta incompleto", () => {
    const a = avaliarPedido(base({ procedimentoId: "" }), D);
    expect(a.completo).toBe(false);
  });

  it("recebimento de cirurgia eletiva sai no prazo de repasse do contrato (60 dias)", () => {
    const a = avaliarPedido(sugerido("artrodese-lombar", SULAMERICA), D);
    expect(a.recebimento.dias).toBe(60);
    expect(a.recebimento.data).toBe("2027-01-09");
    expect(a.recebimento.valor).toBe(a.honorario.valor + a.complemento.garantido);
  });
});

describe("sugestões ao médico", () => {
  it("o pedido sugerido usa as preferenciais homologadas e os códigos recomendados", () => {
    const s = pedidoSugerido("artrodese-lombar", SULAMERICA, D);
    const padrao = D.padroes["artrodese-lombar"];
    expect(s.codigos).toEqual(padrao.codigosRecomendados.map((c) => c.codigo));
    for (const item of s.itens) {
      const ip = padrao.itens.find((i) => i.itemId === item.itemId)!;
      const marca = D.marcas.find((m) => m.id === item.marcaId)!;
      expect(marca.homologadaEm).toContain(SULAMERICA);
      expect(ip.preferenciais.includes(item.marcaId) || ip.aceitas.includes(item.marcaId)).toBe(true);
      expect(item.qtd).toBe(ip.qtdTipica);
    }
  });

  it("a compra rápida escolhe, por item, a marca aceita de menor liberação", () => {
    const itens = compraRapida("artrodese-lombar", SULAMERICA, D);
    for (const l of leque(D.padroes["artrodese-lombar"], SULAMERICA, D)) {
      const escolhido = itens.find((i) => i.itemId === l.itemId)!;
      const menor = Math.min(...l.aceitas.map((m) => m.liberacaoDias));
      expect(D.marcas.find((m) => m.id === escolhido.marcaId)!.liberacaoDias).toBe(menor);
    }
  });

  it("a previsão do médico soma só pedidos confirmados ou esperando confirmação", () => {
    const pedidos = [
      sugerido("artrodese-lombar", SULAMERICA, { id: "a", status: "confirmado", dataCirurgia: "2026-10-20" }),
      sugerido("artrodese-lombar", SULAMERICA, { id: "b", status: "rascunho", dataCirurgia: "2026-10-20" }),
    ];
    const prev = previsaoMedico("1", pedidos, D, new Date("2026-10-14T12:00:00"));
    const esperado = avaliarPedido(pedidos[0], D).recebimento.valor; // recebe em 2026-12-19 (66 dias)
    expect(prev.d30).toBe(0);
    expect(prev.d90).toBe(esperado);
    expect(prev.ano).toBe(esperado);
  });
});
