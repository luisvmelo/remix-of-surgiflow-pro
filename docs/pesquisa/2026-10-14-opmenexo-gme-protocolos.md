# Pesquisa: OPMEnexo, comitês de padronização (GME) e protocolos clínicos

Pesquisa feita em 14/10/2026 para embasar o fluxo desenhado pelo Luís (dados do hospital → sugestão de combinações → pedido montado pelo médico → revisão de compras → dados consultivos por linha de cuidado).
Contexto da reunião: [../reunioes/2026-10-14-reuniao-opmeia-demerval.md](../reunioes/2026-10-14-reuniao-opmeia-demerval.md).
**Legenda:** VERIFICADO = com fonte; INFERÊNCIA = conclusão nossa.

---

## 1. OPMEnexo (Bionexo)

**O que é (VERIFICADO)**
- O "OPME Nexo" é o **OPMEnexo**, da **Bionexo S.A.**, criado em 2006 para "regular o fluxo de aquisição" de OPME. Cobre "desde o agendamento da cirurgia à aprovação da compra dos insumos pela operadora". [FRE 2024](https://www-api-prod-institucionais-bionexo.azurewebsites.net/files/ac44b3d9-ad85-4f70-86b9-b00980f2f705.pdf)
- A Bionexo **comprou o Tasy da Philips** (€161 mi, concluído em mai/2026), que passou a se chamar "Bionexo Tasy". [Portal ERP](https://portalerp.com/br/noticia/bionexo-conclui-aquisicao-do-tasy-e-lanca-a-bionexo-tasy-plataforma-integrada-que-conecta-o-ecossistema-de-saude-na-america-latina)

**Fluxo (VERIFICADO)**
- Etapas: pré-operatório → negociação → aprovação → entrega → cirurgia → pós-operatório → NF-e → faturamento, com SLA em cada etapa. [bionexo.com/gestao-opmes](https://bionexo.com/gestao-opmes/)
- Passo a passo:
  1. O hospital cria o pedido e o sistema checa a elegibilidade da carteirinha.
  2. O pedido de cotação vai para os fornecedores.
  3. O hospital analisa as propostas, com alçadas e sugestões por preço, marca, quantidade e prazo.
  4. A operadora audita e negocia, e a senha de autorização vale 30 dias.
  5. Itens usados sem autorização viram um novo ID e passam por nova cotação. [cartilha Saúde Petrobras](https://portaltiss.saudepetrobras.com.br/documentos/cartilhamudanca/Cartilha_OPME_Orteses_Proteses_e_Materiais_Especiais.pdf)
- Depois da cirurgia, compara o que foi planejado com o que foi usado; tem NF-e integrada e acordos comerciais pré-cadastrados com os fornecedores.
- Publica o índice de preços **I-OPME** (FIPE + Bionexo) desde 2017. [Medicina S/A](https://medicinasa.com.br/bionexo-fipe-iopmes/)

**Modelo de negócio (VERIFICADO)**
- Cobra mensalidade (SaaS) mais implantação. Fornecedores com integração pagam por faixa de volume. Tem a versão OPMEnexo Pro para fornecedores. (FRE 2024)

**Números divulgados (VERIFICADO, autodeclarados por clientes)**
- Glosa de 15% para menos de 5%.
- Autorização em 48h contra 72h.
- Mais de 2.500 a 3.000 fornecedores na rede.

**Concorrentes (VERIFICADO)**
- [Inpart (IS OPME)](https://inpartsaude.com.br/en/healthcare-operators/index.html), atende a Amil.
- [GTPlan](https://conteudo.gtplan.com.br/modulo-de-opme).
- [Gestão OPME](https://conteudo.gestaoopme.com.br/solicitar_acesso_rede_fornecedor).
- [AdviceHealth BuyMed](https://conteudo.advicehealth.com.br/buymed).
- [Saúdi.ia](https://saudi.com.br/a-gestao-de-opme-e-eficiente-na-sua-operadora-de-saude).
- [Autorizamed](https://autorizamed.com.br/para-medicos/), voltado ao médico, a partir de R$ 1.500/mês.

**INFERÊNCIA**
- O OPMEnexo é a camada de **logística, cotação e autorização**. O médico não opera o sistema; o pedido médico entra como anexo.
- Nenhum dos produtos encontrados trata **protocolo de indicação, honorário do médico ou consultoria por linha de cuidado**.

---

## 2. Comitês de padronização com médicos ("GME")

**O nome (VERIFICADO)**
- Não há fonte pública para a sigla "GME". Os nomes formais encontrados são:
  - Comissão de Padronização de Produtos para Saúde (CPPS) [HUAB-UFRN](https://www.gov.br/hubrasil/pt-br/hospitais-universitarios/regiao-nordeste/huab-ufrn/governanca/comissoes-e-comites/regimento-comissao-de-padronizacao-de-produtos-para-saude.pdf);
  - câmara técnica [Manual MS 2016](https://www.gov.br/conitec/pt-br/midias/artigos_publicacoes/manual_praticasgestao_opme_2016.pdf);
  - Comitê Técnico de OPME [RIT 2020](https://rit.openjournalsolutions.com.br/index.php/rit/article/download/25/1/79).
- **INFERÊNCIA:** "Grupo de Materiais Especiais" (o ME de OPME) organizado por especialidade concilia as duas leituras. Confirmar com a Verônica.

**Quem participa e com que frequência (VERIFICADO)**
- Médicos das especialidades, enfermagem, farmácia, compras e diretoria.
- Todos assinam **declaração de conflito de interesses**.
- Reunião mensal (HUAB). Durante um projeto de padronização, duas vezes por semana (RIT).
- O diretor técnico responde pelos implantes e pode delegar ([CFM 2.318/2022, art. 1º](https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2022/2318_2022.pdf)).

**Processo documentado (VERIFICADO, caso da cooperativa de Jundiaí, RIT 2020)**
1. Priorizar especialidades por volume e custo a partir dos dados do ERP. A ortopedia, com 43% do volume, veio primeiro.
2. Na elegibilidade de marcas, definir os itens por procedimento e checar TUSS/TNUMM e registro ANVISA.
3. Reunir os fornecedores. O argumento: item padronizado tem pré-aprovação de compra.
4. Tratar as exceções caso a caso.
5. Acompanhar indicadores mensais por especialidade, empresa e cirurgião.

**Resultado do caso de Jundiaí**
- Adesão às marcas padronizadas foi de **14% para 78%** em um ano.
- Custo de OPME caiu **7%** enquanto a inflação médica (VCMH) subiu 17,3%.
- **Riscos:** resistência dos cirurgiões, falta de prioridade da diretoria e fornecedores inflexíveis.
- **Mitigação:** usar marcas já conhecidas pelas equipes, treinamento, base legal, diretor no comitê e resultados parciais mostrados no caminho.

**EUA, Value Analysis Committees (VERIFICADO)**
- **Como funciona:** formulário de pedido, revisão de evidência e custo, voto. [Advisory Board](https://advisory.com/topics/life-sciences/2021/05/how-value-analysis-committees-work)
- **Resultados de stents:**
  - Providence: 2 fornecedores de stent. [Cardiovascular Business](https://cardiovascularbusiness.com/topics/healthcare-management/healthcare-economics/hospital-saves-535k-though-cardiac-initiatives)
  - Brigham: manteve 3 "porque a tecnologia muda", com cerca de US$ 850 mil de economia. [BWH](https://bwhbulletin.org/2015/03/12/balloons-and-stents-achieving-savings-on-coronary-arterial-devices/)
  - Johns Hopkins: US$ 3,3 mi/ano em coluna. [Hopkins](https://www.hopkinsmedicine.org/news/articles/2015/10/finding-true-value-in-the-supply-chain)

**INFERÊNCIA:** o "5 aceitas → 3 direcionadas" da Verônica são duas decisões separadas:
- a **equivalência clínica**, decidida pelos médicos;
- a **concentração de volume** para negociar, decidida por compras.

Não há fonte brasileira descrevendo esse funil exato.

---

## 3. Protocolos clínicos

**Ciclo (VERIFICADO)**
- **HCFMRP-USP:**
  - Os especialistas escrevem o conteúdo clínico.
  - Um setor administrativo acrescenta CID, códigos de faturamento, formulários de autorização e normas, sem mexer no conteúdo clínico.
  - O protocolo é publicado com **data de reavaliação**: 53 de 73 publicados em 6 meses.
  - Colocar os especialistas como autores reduz a sensação de imposição.
  - [HCRP](https://www.hcrp.usp.br/revistaqualidade/uploads/Artigos/217/217.pdf)
- **HCPA:** tem auditoria de protocolos; sem ela, os ganhos se perdem. [ENAP](https://repositorio.enap.gov.br/handle/1/342)
- **Einstein:** usa a **adesão a protocolos como indicador de desempenho do médico**. [Guia do corpo clínico](https://medicalsuite.einstein.br/pratica-medica/GuiaPraticaMedica/02%20-%20Informações%20ao%20Corpo%20Clinico.pdf)

**Estrutura de um critério de entrada, exemplo TAVI pela diretriz SBC 2020 (VERIFICADO)** — [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8386977)
- **Heart Team** obrigatório.
- **Risco cirúrgico (STS):** <4% baixo, 4–8% intermediário, >8% alto.
- **Escolha do tratamento por idade:** abaixo de 70 anos com baixo risco, cirurgia; acima de 70, TAVI transfemoral.
- **Contraindicação:** expectativa de vida menor que 12 meses.
- **Exames:** eco (AVA ≤1,0 cm², gradiente ≥40 mmHg ou velocidade ≥4 m/s) e angiotomografia.

**Regras externas (VERIFICADO)**
- **DUT:** as Diretrizes de Utilização estão no Anexo II da RN 465/2021 (ANS).
- **Rol:** é exemplificativo desde a Lei 14.454/2022. [Migalhas](https://www.migalhas.com.br/quentes/440412/stf-admite-hipoteses-de-cobertura-fora-do-rol-da-ans-e-fixa-criterios)
- **Junta médica (RN 424/2017):** assistente + operadora + desempatador, inclusive para OPME. [Legismap](https://legismap.com.br/conteudos/artigos-e-noticias/ans-publica-norma-sobre-junta-medica-ou-odontologica)
- **Segunda opinião de coluna no Einstein:** em 4.684 pacientes, **58% não tiveram a cirurgia confirmada**; a lista curta de fornecedores teve custo até 68% menor. [CPI OPME](https://www2.camara.leg.br/atividade-legislativa/comissoes/comissoes-temporarias/parlamentar-de-inquerito/55a-legislatura/cpi-mafia-das-orteses-e-proteses-no-brasil/documentos/audiencias-publicas/apresentacao-miguel-cendoroglo-neto)

**Digital (VERIFICADO)**
- O HCRP planejou ligar o protocolo ao prontuário e preencher automaticamente as solicitações de autorização.
- O Tasy tem protocolos no prontuário eletrônico.
- A Digisystem vende order sets (Elsevier) integrados ao Tasy. [Medicina S/A](https://medicinasa.com.br/?p=28216)

**INFERÊNCIA:** não existe no mercado brasileiro produto que aplique **critério de indicação cirúrgica com OPME no momento do pedido**.

---

## 4. Regras que limitam o desenho (VERIFICADO)

- **A Resolução CFM 1.956/2010 foi revogada pela CFM 2.318/2022** (DOU 17/10/2022). Vigente:
  - o médico define **características**, não marca (art. 2º);
  - é vedado exigir marca ou fornecedor exclusivo (art. 4º);
  - ao recusar o material oferecido, o médico pode indicar **pelo menos 3 marcas** de fabricantes diferentes (art. 8º);
  - na divergência, um árbitro decide em até 5 dias úteis (art. 9º).
  - [CFM](https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2022/2318_2022.pdf)
- **Código de Ética Médica:** o art. 68 veda dependência da indústria; o **art. 69 veda obter vantagem pela prescrição de órteses, próteses e implantes**. [CNJ](https://www.cnj.jus.br/wp-content/uploads/2020/07/lista-prévia-OPME-site-CNJ-atualização-2020.pdf)
- **ANS:** pode exigir justificativa e 3 marcas. [Parecer 24/2021](https://www.gov.br/ans/pt-br/arquivos/acesso-a-informacao/transparencia-institucional/pareceres-tecnicos-da-ans/2020/parecer_tecnico_no_24_2021_orteses_proteses_e_materiais_especiais_opme.pdf)
- **"Máfia das próteses":** o PL 2452/2015 prevê pena de prisão para vantagem indevida. Status atual não verificado.

---

## 5. Como isso se encaixa no fluxo do Luís (INFERÊNCIA)

| Etapa do fluxo | O que a pesquisa acrescenta |
|---|---|
| **Dados do hospital + IA + contratos da operadora** | Dados do ERP para a curva ABC (volume × custo), como fez Jundiaí. Contratos de pacote **e de conta aberta**. |
| **Sugestão de combinações (cirurgia no centro)** | Começa pelo **protocolo** (critérios de entrada estruturados e versionados). Depois vem o **leque do comitê**: itens descritos por característica, com no mínimo 3 marcas equivalentes. Por fim, o ranking por glosa, margem e velocidade de liberação, e os fornecedores por operadora. |
| **Pedido montado pelo médico** | Mostra o honorário: o que a operadora paga pelo código pedido, com a sugestão de codificação correta. **Não há complemento** (decisão de 14/10). Mostra o risco de glosa do código, o tempo estimado de liberação e a previsão de recebimento por cirurgia e no ano, com o prazo. |
| **Revisão de compras ("tudo ok pelas diretrizes?")** | Resultado "dentro do protocolo" ou "fora com justificativa", **sem bloquear** o médico (autonomia, RN 424, CFM 2.318). Exceções passam pelo comitê. |
| **Pedido feito e prazos acompanhados** | Daqui em diante é o território do OPMEnexo e similares: cotação, autorização, NF-e. **Integrar em vez de reconstruir.** |
| **Dados consultivos por linha de cuidado** | Indicadores mensais por especialidade, fornecedor e cirurgião (método Jundiaí): adesão ao protocolo, adesão ao leque, glosa, margem, tempo de liberação, honorário. A consultoria conduz o comitê com esses dados. Inspirações: Mater Dei e a reunião da Verônica. |

**Posicionamento**
- O OPMEnexo resolve **comprar e autorizar**. O espaço livre é **decidir e pactuar**: o que pedir, sob qual protocolo, com qual leque e quanto o médico recebe, mais a consultoria em cima disso.

**Riscos**
- Sem complemento, desaparece o risco do art. 69 do CEM. O leque continua precisando ser descrito por característica, com no mínimo 3 marcas (CFM 2.318).
- **Bionexo + Tasy** juntam ERP e OPME no mesmo dono. Pode ser canal de integração ou concorrente.

> **Atualização (14/10/2026, mais tarde):** a decisão abaixo foi revista. **O complemento médico existe**: é fixo por procedimento, vem do contrato médico–hospital e é pago se o pedido seguir o padrão. Ver a [especificação](../superpowers/specs/2026-10-14-plataforma-unificada-design.md).

**Decisão do Luís (14/10/2026)** (superada)
- **Não existe complemento médico.** O médico recebe só o honorário da operadora.
- Os ganhos do médico vêm de quatro lugares: pedir com a codificação correta, ter menos glosa no código, ter a cirurgia liberada mais rápido e ter previsibilidade e prazo de recebimento.
- As perguntas sobre nome do GME, local dos protocolos e uso do OPMEnexo foram descartadas como irrelevantes.
