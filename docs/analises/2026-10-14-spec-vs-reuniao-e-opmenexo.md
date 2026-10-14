# Análise: a especificação contra a reunião e contra o OPMEnexo

Compara a [especificação da plataforma unificada](../superpowers/specs/2026-10-14-plataforma-unificada-design.md) com:
- as três partes da reunião (~1h40: "OPMEIA e SOLICITA (medium)", "2.0" e "3,0");
- o OPMEnexo ([pesquisa](../pesquisa/2026-10-14-opmenexo-gme-protocolos.md)).

---

## Parte A: a especificação contra a reunião

### A1. O que está de acordo

| O que foi dito na reunião | Quem | Onde está na especificação |
|---|---|---|
| A plataforma atual "trata o médico como infrator, não como parceiro"; "não olha a felicidade do médico" | Vini / Álvaro | O médico vira parceiro na Consultoria e na aba Médico de Compras (adesão e preferências). O médico tem tela própria, com honorário garantido e previsão de recebimento. |
| A plataforma é "um ponteiro, não uma alavanca nem um acelerador" | Demerval | A alavanca passa a ser o padrão da comissão aplicado **na hora do pedido**, com sugestões só do que é permitido e trocas dentro do leque. Antes, só se apontava o prejuízo. |
| Padronizar o procedimento "desde a codificação até o consumo"; o médico precisa "pedir certo" | Demerval | Etapa de Codificação com os códigos recomendados e o alerta de glosa; comissão com codificação e itens. |
| "Abrir o leque, deixar os médicos cientes e depois direcionar"; 5 aceitas → 3 mais rentáveis | Verônica | Comissão com leque por item (mínimo de 3 marcas) e atalhos de balanceamento. A IA traz o pré-modelo e os médicos validam. |
| Os protocolos e critérios de entrada já existem; "o sistema já vai ler isso" | Verônica | Protocolo dentro do padrão do procedimento, com o modal "fora do protocolo" no wizard. |
| Homologação do fornecedor junto à operadora, respeitando a precificação | Demerval | Abas por operadora com homologação; não homologados apagados com o motivo. |
| Previsibilidade: "o médico tem que saber quanto vai receber" | Demerval / Verônica | Honorário garantido (sim/não), valor, e previsão de recebimento em 30, 60 e 90 dias e no ano. |
| Autorização caiu de 21 para 5 dias | Demerval | Tempo de liberação como critério nas sugestões, KPI com antes e depois, e a "sugestão de compra rápida". |
| Começar pelos procedimentos de maior valor (curva ABC), não por todos | Demerval / Álvaro | Diagnóstico e Home com curva ABC e "ganho possível" por procedimento. |
| Os KPIs dos setores não conversam: regulação (liberar e glosa), compras (margem e prazo de pagamento), financeiro (caixa) | Demerval | Home com glosa, liberação e margem, mais o indicador de prazos (pagar fornecedor contra receber da operadora); prazo de pagamento negociado em Compras. |
| Pacote é a origem do problema; trazer o não-pacote para a jogada | Demerval / Luís | Pacote (teto e consumo) e conta aberta (tabela por item e margem) por operadora. |
| Medir o antes e depois para virar o case e justificar a cobrança | Álvaro | KPIs da Home sempre com antes e depois. |
| Plataforma + conhecimento: "só a plataforma vazia, não"; o data mine do consultor | Álvaro | Gestão + consultoria por linha de cuidado, com recomendações "o que vimos / o que fazer / quanto vale". |
| Três visões: OPME/compras, médico e operadora | Álvaro (parte 3) | OPME/compras e médico estão na especificação. A operadora ficou fora conscientemente (ver A3). |
| Começar com hospital + médico; a operadora depois, e quem a traz é o hospital | Verônica / Álvaro | Operadora e fornecedor existem só como dados, sem tela. |
| Não levar "fórmula mágica"; oferecer ferramentas para cada hospital pactuar do seu jeito | Verônica | Configuração dos pesos, comissão que ajusta o pré-modelo e o leque montado pelo próprio hospital. |
| Protótipo barato, sem banco de dados, para o Demerval vender | Álvaro / Luís | Dados de exemplo, sem banco, ML e ERP fora do escopo. |
| O hospital decide o material, depois da pactuação com o médico | Demerval | A comissão define; o médico pode sair do padrão com justificativa; Compras revisa. |

### A2. O que diverge de propósito (decisão do Luís, mas com risco a registrar)

1. ~~Não existe complemento médico.~~ **Resolvido em 14/10.** O complemento voltou para a especificação: fixo por procedimento, definido no contrato médico–hospital, pago se o pedido seguir o padrão sugerido pelo hospital e perdido se não seguir. Fica alinhado com o caso do Demerval.
2. **O leque tem no mínimo 3 marcas, e não um fornecedor exclusivo.**
   - **Na reunião:** o Demerval exigiu exclusividade ("se abrir para terceiros volta o leilão").
   - **Na especificação:** segue a Verônica e a CFM 2.318/2022, que proíbe exigir fornecedor exclusivo.
   - **Avaliação:** a decisão é a certa legalmente, mas contradiz a experiência dele.
3. **Não há cardápio fechado.**
   - **Na reunião:** no caso do Demerval, o médico pedia o procedimento e o hospital entregava tudo.
   - **Na especificação:** o médico monta o pedido a partir das sugestões permitidas.
   - **Avaliação:** está mais perto da Verônica (dar o leque e direcionar) e respeita a autonomia médica.

### A3. Lacunas: coisas citadas na reunião que não estão na especificação

| Ponto da reunião | Quem | Situação | Sugestão |
|---|---|---|---|
| **O contrato médico–hospital digitalizado** ("o contrato pode ser digitalizado e ser parte da plataforma? Deve.") | Álvaro / Demerval | Ausente | Registrar como próxima fase, ou acrescentar uma visão simples de "termo de adesão do médico ao padrão". |
| **Atrair médicos de outros hospitais** ("esse cara precisa da previsibilidade de quanto receberia para operar no Português") | Demerval / Verônica | Parcial. Só quem já está no sistema vê a previsão. | Uma tabela de previsibilidade por procedimento e operadora, para o hospital mostrar a médicos novos. |
| **Vários hospitais por consultor** ("vários Demervais"; consultoria escalável, não hora-homem) | Álvaro (parte 3) | Ausente. A especificação é para um hospital só. | Fora do protótipo, mas registrar. O OPME.AI já teve "multi-hospital/rede" no primeiro mock. |
| **Mostrar ao hospital o que vamos acessar** (segurança e transparência dos dados no plugin) | Álvaro | Ausente | Uma tela no Diagnóstico com "fontes de dados lidas / o que o hospital também vê". É barato e ajuda a vender. |
| **Tempo de cirurgia** como indicador ("o tempo de liberação, o tempo da cirurgia...") | Álvaro (2.0) | Ausente | Acrescentar aos KPIs se houver o dado no ERP; senão, registrar. |
| **Codificação abusiva** (vários códigos para o mesmo ato) | Demerval | Só o alerta de glosa | Suficiente para o protótipo. |
| **Antecipação de recebíveis** para o médico | Vini | Fora do escopo (registrado) | Está de acordo. |
| **Operadora como terceira visão** | Vini / Álvaro | Fora conscientemente | Está de acordo, mas o Vini vai cobrar. A especificação já mantém os dados prontos para isso. |
| **Cobrança por procedimento ("taxímetro")** | Álvaro | Modelo de negócio, não produto | Um indicador "ganho gerado desde a implantação" na Home ajudaria a justificar a cobrança. |

---

## Parte B: a especificação contra o OPMEnexo (estamos entrando na área deles?)

**O que o OPMEnexo faz (com fonte):**
1. o hospital cria o pedido e checa a elegibilidade da carteirinha;
2. cotação com fornecedores;
3. análise das propostas com alçadas e sugestões de escolha por preço, marca, quantidade e prazo;
4. auditoria e negociação pela operadora, e senha de autorização;
5. entrega e cirurgia;
6. comparação do planejado com o usado;
7. NF-e e faturamento;
8. SLA por etapa, acordos comerciais pré-cadastrados, rastreabilidade, dashboards, agendamento cirúrgico e estoque.

Há versões para fornecedor (Pro) e para operadora, e o índice de preços I-OPME (FIPE). **O médico não usa o sistema.**

| Parte da especificação | Sobreposição com o OPMEnexo | Comentário |
|---|---|---|
| Diagnóstico (curva ABC, pré-modelo pela IA) | **Nenhuma** | O OPMEnexo não faz diagnóstico de padrão. |
| Comissão (padrão, protocolo, codificação, leque, teto, versões, sugestões de alteração) | **Nenhuma** | Nada encontrado sobre comitê, protocolo ou padronização. É o espaço livre identificado na pesquisa. |
| Wizard do médico e da secretária com honorário e previsão | **Nenhuma** | No OPMEnexo o pedido médico é um anexo; o médico não opera o sistema. |
| Consultoria por linha de cuidado | **Nenhuma** | Os dashboards deles são operacionais, não consultivos. |
| Home da gestão (KPIs, recortes, comparativos, balanceamento) | **Baixa** | Eles têm dashboards e o I-OPME, mas não a leitura por cirurgia, operadora e fornecedor ligada a padrão e honorário. |
| Compras: conformidade, pedir ajuste ao médico, aceitar fora do padrão | **Nenhuma** | Não existe no OPMEnexo, porque ele não tem padrão nem médico. |
| Compras: escolha de fornecedor, otimizador de margem, trocas | **Média** | Eles sugerem escolha por preço, marca e prazo **sobre as cotações recebidas**. O OPME.AI sugere **antes da cotação**, com base em histórico, homologação, glosa e o leque da comissão. É o ponto mais próximo deles. |
| Compras: prazos de autorização e entrega, atrasos | **Alta** | É o SLA por etapa deles. |
| Compras: prazo de pagamento negociado e vencimentos | **Média** | Eles têm acordos comerciais e NF-e; o prazo de pagamento costuma ficar no ERP. |
| Teto do pacote no pedido | **Baixa** | Não encontrado no OPMEnexo. |
| Gerente de compras (margem na mesa, desempenho por comprador, atrasos) | **Média** | A parte de atrasos é parecida com os SLAs deles; margem na mesa e desempenho por comprador não. |
| Cotação, negociação com a operadora, autorização, NF-e, faturamento, estoque | **Seria total** | **Já está fora do escopo** na especificação. |

**Conclusão**
- **Continuamos fora da área do OPMEnexo no que é o centro do produto:** diagnóstico, comissão, protocolo, médico, consultoria e conformidade.
- **A única zona de contato é o final operacional de Compras**, que eles já cobrem com SLA:
  - acompanhamento de prazos de autorização e entrega;
  - sugestão de fornecedor;
  - vencimentos.
- **O que eu recomendo:**
  - **Manter** o acompanhamento de prazos em Compras **só como leitura**: registrar e mostrar; não negociar nem cotar.
  - **Posicionar o pedido confirmado como o ponto de entrega para o OPMEnexo** (ou outro portal). O nosso termina onde o deles começa: a cotação.
  - **Não acrescentar nada** de cotação, propostas de fornecedores, NF-e ou estoque.
- **Um risco:** a Bionexo agora tem o Tasy (o prontuário e ERP do hospital). Se um dia ela quiser descer para protocolo e médico, tem o canal. Nossa defesa é a consultoria e o médico como usuário, que não estão no modelo dela.

---

## Parte C: ajustes sugeridos na especificação (para o Luís decidir)

1. **Uma tela "Fontes de dados"** no Diagnóstico: o que o plugin leu e o que o hospital também vê. Barato, e ajuda a vender (pedido do Álvaro).
2. **Um indicador "ganho gerado desde a implantação"** na Home. Ajuda a justificar a cobrança por procedimento.
3. **Uma tabela de previsibilidade por procedimento e operadora** para atrair médicos novos (pedido do Demerval e da Verônica).
4. **Uma frase na especificação** dizendo que o pedido confirmado é o ponto de entrega para cotação no OPMEnexo ou outro portal, e que **o acompanhamento de prazos em Compras é só leitura**.
5. **Registrar como "próximas fases":** o contrato médico–hospital digital, várias unidades por consultor e o tempo de cirurgia.
