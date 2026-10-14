# Plataforma unificada SurgiFlow + OPME.AI: conceito por perfil

**Status:** especificação para revisão · 14/10/2026
**Base:** reunião com Demerval, Verônica, Álvaro e Vini ([síntese](../../reunioes/2026-10-14-reuniao-opmeia-demerval.md)), pesquisa sobre OPMEnexo, comitês e protocolos ([pesquisa](../../pesquisa/2026-10-14-opmenexo-gme-protocolos.md)) e o fluxo desenhado pelo Luís.

---

## 1. Objetivo

Um protótipo de demonstração do serviço **consultoria + tecnologia** para hospitais: ajudar o hospital a **fazer mais cirurgias com mais rentabilidade**, pondo o médico como parceiro. A plataforma é o "data mine" do consultor.

- O protótipo junta, **num único app**, o SurgiFlow (montagem do pedido pelo médico e pela secretária) e o OPME.AI (Compras e Gerente de compras), e acrescenta a camada de **Gestão + consultoria** (diagnóstico, comissão e consultoria).
- Usa **dados de exemplo, sem banco de dados**, para o Demerval e o Vini apresentarem a hospitais (Santa Casa do Recife, Rede Américas).
- **Critério de sucesso da demo:** percorrer ao vivo o fluxo da seção 4 de ponta a ponta, com o mesmo pedido aparecendo em todos os perfis.

---

## 2. Decisões fixas

1. **O médico recebe o honorário da operadora mais um complemento pago pelo hospital, se seguir o pedido sugerido pelo hospital.**
   - **Honorário da operadora:** fixo por procedimento e plano, vindo da tabela da operadora.
   - **Complemento:** **configurável pelo hospital, por procedimento** (seção 5.2). Não é percentual. Pode funcionar de dois jeitos:
     - **pré-definido:** um valor único, pago se o pedido seguir o padrão completo (o modelo do Demerval);
     - **por condições:** o hospital escolhe as condições e o valor de cada uma, e o médico recebe a soma das que cumprir. Exemplos de condição: itens homologados, dentro do padrão, código recomendado, documentos completos, prazo de liberação, margem mínima, fornecedor preferencial.
   - O médico vê, durante a montagem, **quais condições está cumprindo e quanto de complemento está garantido ou perdido**. Isso fica marcado no card do pedido.
   - **Cuidado legal:** as condições ligadas a **fornecedor** ou a **margem** aparecem com o aviso "requer validação do jurídico", sem bloqueio (CEM art. 69 e CFM 2.318, art. 4º). As demais estão ligadas à conformidade, que é o modelo que o Demerval validou com o jurídico.
2. **O médico e a secretária nunca veem a margem do hospital.**
3. **Nada é bloqueado.** Sair do protocolo ou do padrão é permitido e fica sinalizado para todos, com justificativa. Isso respeita a autonomia médica, a RN 424/ANS e a CFM 2.318/2022.
4. **O leque é descrito por característica e tem, no mínimo, 3 marcas aceitas por item** (CFM 2.318/2022, art. 8º). O sistema avisa quando houver menos de 3, mas não impede.
5. **O padrão de cada procedimento é uma base única, ajustada por operadora.** Os itens são os mesmos para todas as operadoras; o que muda é quais fornecedores entram (pela homologação) e o teto do pacote.
6. **Tudo é alimentável.** O sistema reaprende com cada cirurgia e gera **"sugestões de alteração"** para padrões já aprovados.
7. **Fornecedor e operadora não têm tela.** Existem como dados. Os contratos são cadastrados na aba Contratos da Gestão, e a homologação, os preços e os prazos vêm dos dados do hospital.
8. **Cotação, autorização na operadora e faturamento ficam fora** (território do OPMEnexo e similares). Aqui se registram os resultados e se acompanham os prazos.
9. **Um app só, com login por perfil.**
10. **Os contratos alimentam o sistema todo.**
    - **Contrato médico–hospital:** procedimentos credenciados, se o médico participa do complemento e o prazo de repasse.
    - **Contrato da operadora:** pacote (teto) ou conta aberta (tabela por item), e a tabela de honorário.
    - O honorário garantido, a previsão de recebimento, o teto e a margem são calculados a partir dessas duas fontes. O complemento vem das regras do procedimento (seção 5.2).

---

## 3. Perfis

| Perfil | Origem | Dispositivo | Faz |
|---|---|---|---|
| **Gestão + consultoria** | novo + Comercial do OPME.AI | Desktop | Diagnóstico, comissão de padrões, contratos, consultoria e configuração |
| **Consultor** | novo | Desktop | Carteira com os hospitais que atende; escolhe um e entra na Gestão + consultoria dele |
| **Médico** | SurgiFlow | Celular | Monta ou valida pedidos e acompanha o próprio recebimento |
| **Secretária** | SurgiFlow | Desktop | Monta pedidos em nome do médico |
| **Compras** | OPME.AI (operacional) | Desktop | Revisa cada pedido, pede ajustes, otimiza dentro do leque e acompanha prazos |
| **Gerente de compras** | OPME.AI (tático) | Desktop | Margem deixada na mesa, desempenho por comprador, atrasos |

A **regulação** não é um perfil separado. As funções dela (homologação, glosa, conformidade) ficam dentro de Compras, como o OPME.AI já faz.

---

## 4. Fluxo ponta a ponta

0. **Contratos.** Os contratos médico–hospital e os da operadora são cadastrados na Gestão.
1. **Diagnóstico.** O plugin lê o histórico do hospital e cria um **pré-modelo** para cada procedimento.
2. **Comissão.** Na Gestão, a comissão ajusta e aprova o padrão de cada procedimento.
3. **Montagem do pedido.** A secretária ou o médico monta o pedido, podendo partir do **pedido sugerido pelo hospital**, que mostra o honorário mais o complemento. O sistema só sugere o que é permitido. Se a pessoa escolher algo fora, aparece "fora do protocolo / fora do padrão · complemento perdido".
4. **Validação pelo médico.** O médico valida, ou o pedido segue sozinho se ele ligou o "envio automático quando 100% conforme".
5. **Revisão por Compras**, que pode:
   - **confirmar;**
   - **pedir ajuste:** o card do médico e da secretária ganha uma tag com o motivo, o médico corrige e o pedido volta para Compras;
   - **aceitar fora do padrão:** o motivo fica registrado e alimenta a comissão.
6. **Confirmado.** Compras acompanha os prazos (autorização, entrega, cirurgia e pagamento ao fornecedor), e o médico vê a previsão de recebimento.
7. **Consultoria.** Os dados voltam para a Gestão (Home, Consultoria e as sugestões de alteração na comissão).

**Status do pedido, os mesmos para todos os perfis:** Rascunho → Aguardando o médico → Esperando confirmação (com tag de ajuste, se houver) → Confirmado.
Quando o médico devolve o pedido à secretária, ele volta para **Rascunho** com uma tag mostrando o motivo.

---

## 5. Gestão + consultoria

**5.1 Home**
- **Pendências:**
  - procedimentos sem padrão;
  - padrões com a revisão vencendo;
  - quantidade de **sugestões de alteração** aguardando a comissão.
- **KPIs agregados, sempre com o antes e depois:**
  - % de pedidos dentro do padrão;
  - glosa;
  - tempo de liberação;
  - margem;
  - um único indicador de prazos: o prazo médio de pagamento a fornecedores comparado ao prazo médio de recebimento das operadoras.
- **Recortes:** um seletor alterna entre **cirurgia, operadora e fornecedor**. Um "comparar" coloca 2 ou 3 itens lado a lado, e frases curtas geradas pelo sistema apontam a rentabilidade e os pontos positivos e negativos de cada um.
- **BI "fornecedores mais pedidos fora do padrão":** quantas vezes, por quais médicos, glosa, liberação e custo a mais de cada um.
- **Gráfico de balanceamento:** cada ponto é um procedimento, com margem num eixo e tempo de liberação no outro; a glosa aparece no tamanho ou na cor do ponto.
- **"Ganho gerado desde a implantação"**: em destaque. É o argumento do case e da cobrança por procedimento.
- **"Fontes de dados"**: um link que mostra o que o plugin leu do hospital (tabelas e períodos do ERP) e o que o hospital também vê. Serve para passar segurança na venda.
- Não há listas operacionais (pedido por pedido, vencimentos). Isso é de Compras.

**5.2 Comissão**
- **Catálogo:** todos os procedimentos agrupados por especialidade.
  - Status de cada um: pré-modelo da IA, em ajuste, definido (vN) ou revisão vencendo.
  - Selo **"Nova sugestão de alteração"** quando o histórico mostrar algo melhor.
  - Volume por mês e ganho possível.
- **Montagem de um procedimento**, em estilo wizard:
  - **Abas por operadora.** Cada aba mostra:
    - a homologação de cada fornecedor naquela operadora;
    - se o contrato é **pacote**: o teto contratual e quanto o padrão consome dele, no melhor e no pior caso do leque;
    - se é **conta aberta**: o que a operadora paga por item e a margem.
  - **Itens recomendados pela IA**, com tipo, característica e quantidade típica. Para cada item, os fornecedores aparecem com tempo de liberação, glosa, margem, homologação e **tempo médio de cirurgia com aquela marca**. Os não homologados aparecem apagados, com o motivo. A comissão clica para montar o leque e vê o aviso se houver menos de 3 marcas.
  - **Itens pedidos por fora do pré-modelo**, com a frequência e o custo, e a opção de incluir no padrão.
  - **Códigos recomendados**, com o alerta para códigos que costumam glosar.
  - **O protocolo do procedimento**: critérios de entrada, fonte e data de revisão. É ele que aparece no modal para o médico.
  - **Atalhos de balanceamento:** "mais rápido", "mais rentável" e "equilíbrio (IA)".
  - **Complemento ao médico**, configurado pelo hospital para este procedimento:
    - **Modo pré-definido:** um valor único, pago se o pedido seguir o padrão completo.
    - **Modo por condições:** liga/desliga cada condição e define o valor dela. As condições disponíveis são:
      - itens homologados;
      - dentro do padrão;
      - código recomendado;
      - documentos completos;
      - prazo de liberação de até N dias;
      - margem mínima de X% (aviso jurídico);
      - fornecedor preferencial do leque (aviso jurídico).
    - **Prévia:** "seguindo o pedido sugerido, o médico recebe R$ Y de complemento". O custo do complemento entra no consumo do teto e na margem do padrão.
  - **Aprovar** cria uma versão, com data de revisão e histórico de mudanças.
- **Sugestões de alteração**, num aviso no topo do procedimento: o que mudar, os números de antes e depois e o efeito no teto ou na margem. Aceitar gera uma nova versão.

**5.3 Consultoria**
- A aba atual, mais os **Insights e Resultados do módulo Comercial do OPME.AI**.
- Organizada por **linha de cuidado**: cardio, trauma, ortopedia, neuro, hemodinâmica e obstetrícia.
- Recomendações no formato "o que vimos / o que fazer / quanto vale".
- Os médicos aparecem como **parceiros**: volume, adesão ao padrão, glosa evitada e rapidez de liberação.
- **Tempo de cirurgia** (tempo médio de sala) por procedimento e por médico, com o antes e depois.

**5.4 Configuração**
- Se as sugestões consideram a margem do hospital.
- O peso de cada critério na recomendação: liberação, glosa e margem.
- As configurações herdadas do OPME.AI: equivalência técnica e convênios excluídos.

**5.5 Contratos**
- **Contratos médico–hospital**, um por médico:
  - procedimentos credenciados;
  - **se participa do complemento** (os valores e as condições ficam nas regras de cada procedimento, na Comissão);
  - prazo de repasse (ex.: 60 dias para eletiva, 100 para urgência);
  - vigência.
- **Contratos com operadoras**, um por operadora e procedimento:
  - pacote (teto e o que está incluso) ou conta aberta (tabela por item);
  - tabela de honorário por procedimento e plano;
  - prazo médio de pagamento.
- **Tabela de previsibilidade:** uma visão pronta para mostrar a médicos de **outros hospitais** quanto receberiam operando aqui, por procedimento e operadora (honorário + complemento, sem glosa, e em quanto tempo). Pode ser exportada ou compartilhada.

**5.6 Consultor** (perfil próprio, com os 3 níveis no protótipo)
1. **Carteira:** os hospitais que ele atende (2 ou 3 de exemplo). Cada hospital aparece com:
   - a fase: diagnóstico, comissão (N de M padrões) ou acompanhamento;
   - o ganho gerado desde a implantação;
   - os alertas: sugestões de alteração e revisões vencendo.
   Escolhendo um hospital, ele entra na Gestão + consultoria daquele hospital.
2. **Comparação entre hospitais (benchmark):** o mesmo procedimento em cada hospital (margem, liberação, glosa, adesão ao padrão). Um padrão que funciona num hospital pode ser enviado como **sugestão de alteração** para a comissão de outro.
3. **Acompanhamento comercial:** por hospital, o ganho gerado, o número de procedimentos cobrados (o "taxímetro") e o valor a receber pelo serviço e pelo consultor parceiro, mês a mês.

---

## 6. Wizard de montagem do pedido (médico e secretária)

As etapas são as atuais, com as mudanças abaixo. Não existe etapa de protocolo e **nada vem pré-preenchido**.

**O pedido sugerido pelo hospital** aparece desde o início, como um card ao lado:
- **"Seguindo o pedido sugerido: honorário R$ X + complemento R$ Y."**
- Um botão aplica o sugerido de uma vez.
- O médico pode montar diferente (por exemplo, pedir menos itens). O card mostra o tempo todo **cada condição do complemento** (cumprida ou não, e quanto vale) e o total garantido. Condições de margem aparecem sem números, só como "condição do hospital atendida / não atendida".

1. **Paciente, operadora + plano e procedimento principal.** Ao escolher, o sistema carrega o padrão vigente para aquela operadora.
2. **Codificação** (substitui a etapa "Proc. Secundários"):
   - os códigos recomendados aparecem como sugestão;
   - escolher um código que costuma glosar mostra o alerta;
   - os secundários são sugeridos pelo padrão.
3. **Itens:**
   - o sistema **sugere só o que é permitido** pelo padrão e pelo protocolo, e a pessoa escolhe (pode pedir menos itens);
   - para cada sugestão aparecem a marca, a liberação e a glosa, **sem a margem**;
   - o botão **"Sugestão de compra rápida"** aplica a combinação que libera mais rápido dentro do protocolo;
   - escolher algo fora mostra a tag **"Fora do protocolo"**, avisando que o **complemento foi perdido** e o honorário deixa de estar garantido. Clicar na tag abre o **modal do protocolo**. A pessoa pode pedir mesmo assim, informando uma justificativa.
4. **Documentos:** a lista de obrigatórios vem do protocolo.
5. **Resumo:**
   - o checklist de conformidade: protocolo, código, itens no padrão, homologados e documentos;
   - **honorário: garantido sim ou não**, e o valor;
   - **complemento: garantido ou perdido**, e o valor (vem do contrato);
   - a liberação estimada;
   - a **previsão de recebimento**, com valor e data.

**Sempre visíveis durante a montagem:** honorário (sim ou não), complemento (garantido ou perdido), previsão de recebimento e risco de glosa.

**Saem do wizard atual:** as faixas A/B/C e o complementar percentual por item (o complemento passa a ser fixo, do contrato), os cards "Recomendado / Combo histórico" e a seção Equivalência (absorvida pelo leque). O fluxo "Pacote Sugerido" é **substituído pelo pedido sugerido pelo hospital**.

---

## 7. Médico (celular)

- **Home:**
  - a **previsão de recebimento** (honorário + complemento) para os próximos 30, 60 e 90 dias e para o ano;
  - os pedidos em abas: **Aguardando minha validação**, **Esperando confirmação** (com tag quando Compras pedir ajuste) e **Confirmados**;
  - os pedidos fora do padrão ficam destacados.
- **Pedido:** o checklist de conformidade, o honorário garantido (sim ou não) e o complemento (garantido ou perdido). As ações são aprovar, devolver à secretária ou editar (que abre o wizard).
- **Cards fora do padrão** mostram "complemento perdido".
- **Configuração:** "enviar automaticamente quando estiver 100% conforme". Saem "honorário mínimo" e "glosa máxima".
- **Não vê:** margem, comissão e consultoria.

## 8. Secretária (desktop)

- **Home** com as colunas Rascunho, Aguardando o médico, Esperando confirmação (com tags) e Confirmado.
- **Nova solicitação:** escolher o médico e seguir o wizard da seção 6.
- O botão "Voltar ao início" continua, com a opção de salvar rascunho.
- **Vê o mesmo que o médico**, nunca a margem.

---

## 9. Compras (OPME.AI operacional)

**Fica como está:**
- a lista e o kanban de cirurgias;
- o otimizador de margem;
- a montagem com os fornecedores do médico mais as alternativas;
- homologação por operadora, risco de glosa, margem atual contra possível, trocas e o histórico do procedimento.

**O que é novo:**
1. **O pedido chega estruturado do wizard**, com itens, códigos e justificativas. A leitura de PDF continua para médicos que não usam o sistema.
2. **Conformidade ao padrão e ao protocolo:**
   - as tags "fora do protocolo" e "fora do padrão" no card;
   - a justificativa do médico com o protocolo ao lado;
   - as sugestões de troca restritas ao **leque** da comissão.
3. **Pedir ajuste** escolhendo o item e o motivo. Isso vira a tag no card do médico e da secretária, e o status fica sincronizado.
4. **Aceitar fora do padrão** com o motivo registrado, que alimenta a comissão e o BI de fora do padrão. O pedido segue marcado como "complemento perdido".
5. **O efeito das trocas no tempo de liberação** (dias de autorização), além de margem e glosa.
6. **O teto contratual do pacote** no pedido: quanto ele consome.
7. **O prazo de pagamento negociado com cada fornecedor e os vencimentos.**

**A aba "Médico" do pedido** passa a mostrar **adesão ao padrão e preferências**, e deixa de mostrar o ranking punitivo de glosa.

## 10. Gerente de compras (OPME.AI tático)

**Fica como está:** margem deixada na mesa, "ainda pode ganhar", margem baixa, risco alto, não homologados, desempenho por comprador e atrasos.

---

## 11. Dados de exemplo (entidades)

| Entidade | Campos principais |
|---|---|
| **Especialidade / linha de cuidado** | nome, procedimentos |
| **Procedimento** | código TUSS, especialidade, volume, códigos recomendados, protocolo, padrão vigente e histórico de versões |
| **Protocolo** | critérios de entrada (texto), itens e códigos permitidos, documentos obrigatórios, fonte, data de revisão |
| **Padrão (versão)** | itens por característica com a quantidade típica; leque de fornecedores por item e por operadora; status; data de aprovação; sugestões de alteração pendentes |
| **Operadora** | contrato por procedimento: pacote (teto, custo hospitalar estimado) ou conta aberta (tabela por item); homologação item × fornecedor; prazo médio de autorização; prazo médio de pagamento; tabela de honorário por procedimento e plano |
| **Fornecedor / marca** | custo por item, tempo de liberação, glosa histórica, prazo de entrega, **prazo de pagamento negociado** |
| **Médico** | especialidade, adesão ao padrão, envio automático (sim/não), contrato |
| **Contrato médico–hospital** | médico, procedimentos credenciados, participa do complemento (sim/não), prazo de repasse, vigência |
| **Regra de complemento** | procedimento, modo (pré-definido ou por condições), valor único ou lista de condições (tipo, parâmetro, valor, aviso jurídico) |
| **Contrato com operadora** | operadora, procedimento, pacote (teto, itens inclusos) ou conta aberta (tabela por item), tabela de honorário por plano, prazo médio de pagamento |
| **Hospital** | nome e fase (para a carteira do consultor), fontes de dados lidas, data de implantação, ganho gerado, procedimentos cobrados |
| **Pedido** | médico, secretária, paciente, operadora + plano, procedimento, códigos, itens, status, flags (fora do protocolo, fora do padrão, não homologado), justificativas, ajustes pedidos, datas e prazos |
| **Histórico** | as cirurgias passadas, incluindo o **tempo de cirurgia**, que alimentam o diagnóstico, os pré-modelos, as sugestões de alteração e a consultoria |

**Fonte única de cálculo** (como `src/lib/remuneracao.ts` é hoje):
- honorário garantido sim/não e complemento garantido ou perdido;
- conformidade;
- consumo do teto e margem;
- liberação estimada;
- previsão de recebimento.

## 12. O que sai do protótipo atual

- O complemento **percentual** por item: a proporção, as faixas A/B/C e o simulador de equilíbrio. O complemento continua, mas **fixo por procedimento, vindo do contrato**.
- A aba "Números" da gestão, substituída pela Home.
- O "Pacote Sugerido" do fluxo do médico.
- "Honorário mínimo" e "glosa máxima" nas configurações do médico.

## 13. Fora do escopo

- Telas de fornecedor e operadora.
- Cotação, autorização, NF-e e faturamento.
- Banco de dados real, ML real e integração com ERP (no protótipo, os "apontamentos do ML" são dados de exemplo).
- Antecipação de recebíveis para o médico (ideia registrada para depois).

## 14. Premissas

- **Confirmada em 14/10:** o OPME.AI (`Desktop/Tec/Trabalhos/Valorian/opme-board-ace/frontend`, 123 arquivos) usa o mesmo stack deste projeto: React 18, Vite 5, Tailwind 3, shadcn/Radix, React Router 6, Recharts e React Query. As telas de Compras e Gerente podem ser trazidas para cá **só com os dados de exemplo**, sem o backend FastAPI legado.
- Os dados de exemplo dos dois projetos serão unificados num único conjunto (mesmos médicos, procedimentos, operadoras e fornecedores).
