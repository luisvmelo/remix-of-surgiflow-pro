# Reunião OPMEIA × SolicitaCirurg — síntese

Reunião com Demerval, Verônica, Álvaro, Vinícius (Vini) e Luís. Antônio ausente (indo para o CONAP).
Fontes: transcrições "OPMEIA e SOLICITA (medium)" (parte 1, reunião principal), "OPMEIA SOLCIITA 2.0" (fechamento)
e "3,0" (conversa depois que o Demerval saiu). Anotações do Luís: [2026-10-13-anotacoes-reuniao.md](2026-10-13-anotacoes-reuniao.md).

---

## 1. Quem é quem

| Pessoa | Papel |
|---|---|
| **Demerval** | Dono de empresas de OPME, divididas por nicho (coluna, medicina regenerativa…). Montou o caso do Hospital Português. Entra com know-how e vendas. Vai ser o consultor. |
| **Verônica** | Médica, atua com os GME (grupos de especialidades médicas) do Hospital Português; padronização na cardiologia/hemodinâmica. |
| **Álvaro** | Triwings. Conduz a visão de modelo de negócio: consultoria + tecnologia. |
| **Vinícius (Vini)** | CEO da Triwings. Já trabalhou em hospital, TI e vendas; já comprou OPME. Vai ao CONAP. |
| **Luís** | Desenvolve a plataforma e os protótipos. |
| **Lenny** | Regulação do Hospital Português — o produto OPMEIA nasceu das dores dela. |

---

## 2. O caso do Hospital Português (a história que sustenta tudo)

**O problema**
- O mercado tem uma única fonte pagadora: a operadora. O hospital sempre focou no paciente; **o médico sempre ficou à margem**, desvalorizado.
- O planejamento do hospital é top-down, baseado em demanda espontânea. Só mede aumento de produção, não mede **êxodo** de médicos.
- Surgiram os **pacotes** (valor fechado pago pela operadora). A lógica do hospital virou: comprar mais barato para sobrar margem — **sem combinar com os cirurgiões**.
- Resultado: a medicina parou de evoluir dentro do pacote (técnicas novas, como endoscopia de coluna, biportal e robótica, não cabiam no valor).
- Em 2024 o hospital fez leilão entre dois fornecedores (Vertical e Top Implante) e impôs os mais baratos. Os médicos não conheciam o material, não queriam arriscar o paciente nem o nome → **foram operar no Real D'or (êxodo)**.
- O pacote SulAmérica de artrodese de coluna estava com **−38%** (custava 138 para cada 100 recebidos). Exemplo: artrodese de um nível a R$ 50 mil dava lucro com acesso posterior e prejuízo com anterior/lateral, porque o material muda.

**O que o Demerval fez**
- Projeto com **SulAmérica e Bradesco** unindo os três atores: **operadora, cirurgião (quem detém a demanda) e fornecedor de OPME**.
- Pesquisa de campo com equipes médicas: "o que seria justo em remuneração para o senhor operar aqui?". Expectativa dos médicos: **R$ 8 a 15 mil** por cirurgia.
- Teve acesso aos contratos das operadoras. Do valor do pacote (o "100"), o hospital tira todos os custos, **exceto honorário médico, anestesia e hemoderivados**.
- Dividiu a "pizza", com o compliance/jurídico e o comercial do hospital: uma fatia é a margem do material (fornecedor), uma o custo do hospital, e **uma sobra para complementar o honorário do cirurgião**.
- Resultado: de **−38% para +12 a 14%**. Trouxe médicos que não operavam lá, porque no Português o ganho estava garantido.

**Como o médico entrou no jogo — o honorário**
- O médico recebe o honorário da operadora, que varia muito: endoscopia de coluna pagava **R$ 3 mil** no Bradesco enfermaria e **R$ 9 mil** em apartamento.
- O hospital paga uma **complementação de honorário de VALOR FIXO**, calculada para que a soma (operadora + complemento) atinja a expectativa do médico. Exemplo: artrodese de um nível recebia **R$ 5 mil** de complemento.
- **"Tudo que é colocado como percentual é risco da operação"** → o complemento é fixo, não percentual.
- Condição: seguir o protocolo do pacote. **Usou material fora da casinha ou fabricante não homologado, não recebe.**
- Tudo amarrado em **contrato médico–hospital** (uma nova minuta): o médico se credencia para uma gama de procedimentos. **Tudo no papel.**
- Para o hospital, o fornecedor era **exclusivo** (a empresa do Demerval). Abrir para terceiros "volta o leilão" e perde o controle.
- O médico **parou de pedir produto e passou a pedir procedimento**. O hospital entrega o "cardápio" do procedimento. Fim dos congressos pagos por fornecedor ("zero, é tudo via hospital").
- Autorização caiu de **21 para 5 dias**. Todo mundo ganha.

**Prazos e dinheiro**
- O médico recebe **60 dias** após a produção (eletiva) e **100 dias** (urgência). O fornecedor recebe em 30 dias.
- O hospital recebe da operadora em 45–90 dias e paga em 100–120. **Usa o honorário retido como caixa barato.**
- Ideia levantada: **antecipação de recebíveis para o médico** (fintech/FINEX).

---

## 3. Críticas à plataforma atual (OPMEIA)

- **Origem:** nasceu para a regulação do Português (Lenny). Verifica a homologação item × fornecedor × operadora e a chance de glosa com ML. Como muitos hospitais nem têm regulação, migrou para apoiar **compras** a partir de dados de regulação. Tem três níveis: operacional (pipeline de cirurgias, margem atual vs possível), tático e estratégico.
- **"É um ponteiro, não é alavanca nem acelerador."** Mostra onde há lucro ou prejuízo, e o hospital só vai apertar o fornecedor. Isso reduz prejuízo, **não aumenta margem**.
- **"A gente trata o médico como infrator, não como parceiro."** A tela do médico mostra a % de glosa dele como indicador de performance, e em nenhum momento diz quanto ele vai receber.
- **"Hoje a nossa plataforma não olha a felicidade do médico."**
- Mater Dei (BH): os chefes de equipe participam do resultado e ratea-se com quem traz a cirurgia. É o contraponto ao argumento de insatisfação dos médicos.

---

## 4. O que o Demerval e a Verônica trouxeram de novo

**O alvo é aumentar a demanda, não só cortar custo de material**
- Hoje o hospital só rentabiliza "tirando do distribuidor". O certo é **melhorar a rentabilidade a partir da demanda**.
- Quanto maior a complexidade do procedimento, maior o potencial de monetizar para o hospital.
- **Tirar o material do centro**: o médico não deve se preocupar com OPME; quem se preocupa é o hospital. Mas, para o hospital escolher A, B ou C, precisa primeiro da **pactuação e do aceite do médico**.

**Codificação: o médico precisa "pedir certo"**
- O mesmo procedimento, pedido com códigos diferentes, paga honorários diferentes: Dr. A recebe 1.000, Dr. B 2.000, Dr. C 3.000.
- O próprio histórico da operadora mostra quanto cada código paga. Dá para ensinar o médico a pedir, e o médico que aprende a pedir aceita melhor a sugestão de material.
- Há abuso também: códigos múltiplos para o mesmo ato (infiltração, bloqueio, denervação facetária…) → **o "buraco" da operadora**.
- A padronização não é só de material: **vai da codificação ao consumo**.

**Protocolos e GME (Verônica)**
- O hospital já tem **protocolos clínicos** com critérios de entrada escritos (indicação sim/não). O sistema pode ler e aplicar no pedido.
- **Fluxo do GME:** abrir o leque com os médicos (ex.: padronizar 5 marcas de stent que todos aceitam) → escolher as **3 mais rentáveis** dentro das 5 → direcionar o pedido. Saiu de 9 para 3 fornecedores de stent.
- "Abrir primeiro o leque, deixar os médicos cientes, depois direcionar." Padronizar só pelo preço dá problema.
- O submaterial exato varia com a anatomia do paciente. O que é padronizável são **os critérios de entrada e o material por procedimento**.
- Cada procedimento deve ter seu material padrão; o que diferencia é o preço de cada empresa.

**Por onde começar a jornada**
- A **curva ABC de procedimentos** (por demanda, não só por rentabilidade): "o feijão com arroz" (ex.: stent) antes da TAVI.
- Para cada procedimento: quem opera (Dr. A, B, C), como é remunerado hoje (contas médicas), quanto poderia receber com a codificação correta, e o que fazer para estimular o protocolo.
- **Previsibilidade para o médico:** o histórico médio de pagamento do código por operadora diz quanto ele recebe (ex.: "uma TAVI aqui paga no mínimo R$ 10 mil"). É o que atrai o médico de outro hospital.
- Verônica: **oferecer as ferramentas para a pactuação acontecer**, sem impor o nível de detalhe do caso Português a todos os hospitais.

---

## 5. KPIs por setor e o desalinhamento interno

| Setor | Indicador principal |
|---|---|
| Regulação | Produtividade e redução de glosa (liberar cirurgia) |
| Compras | **Margem e prazo de pagamento** |
| Financeiro | Liquidez, fluxo de caixa e fiscal |

- O ciclo vicioso: a regulação libera rápido porque o indicador dela está baixo → compras aceita prazo ruim para não travar → os fornecedores acumulam passivo de janeiro a outubro → no fim do ano trava tudo → o planejamento do ano seguinte ignora o passivo → empréstimo bancário caro.
- **A oportunidade de consultoria existe porque o "trabalho de casa" não é feito em ~90% dos hospitais.**

---

## 6. Modelo de negócio (visão do Álvaro e do grupo)

- **Proposta de valor:** "através de um serviço de consultoria com uma ferramenta tecnológica exclusiva, ajudamos hospitais a **aumentar a quantidade de procedimentos com maior rentabilidade**", atuando nos pilares **hospital e médico**.
- **Não é uma plataforma vazia:** é conhecimento + plataforma. A tecnologia é o **data mine do consultor**.
- **O ponto de partida:** plugar no ERP do hospital (MV, Tasy…) de forma transparente (o hospital vê o mesmo que o consultor), montar "o caminho das pedras" e atacar **os procedimentos de maior valor agregado**, não todos.
- **Quem compra é o hospital**, mas é preciso convencer o médico. Não se vende nada ao médico.
- **Operadora:** é "o vilão": se perceber margem, reduz o pacote. A proposta é **transparência para os três entes**. No início, só hospital + médico (Verônica e Álvaro). Vini defende que a visão da operadora vai ser necessária para escalar, e quem vai vendê-la à operadora é o próprio hospital (previsibilidade).
- **Mercado:** começar pelos hospitais fora das redes verticalizadas pelas operadoras (citados RHP, Sírio, Santa Catarina); depois pensar em como apoiar as operadoras para escalar.
- **Três plataformas/visões** (parte 3): **OPME/compras**, **médico** e **operadora**. Cada uma é o data mine para construir o blueprint da consultoria. "Só a plataforma sem o consulting não vai adiantar nada."
- **Escala:** é preciso ter vários "Demervais": parceiros/agentes comissionados, quase franquia, com experiência de venda e acesso ao médico. Ou o hospital indica os dele (os **GMS — grupos de material especial**, citados pela Verônica). O papel da Triwings é tornar a consultoria **rápida e escalável, não hora-homem**.
- **Cuidado:** o caso do Demerval é com ortopedistas e coluna, com um viés específico. Não levar fórmula mágica: oferecer a plataforma e sugerir o que hospital e médico podem fazer com ela.
- **Financiamento:** sem dar equity agora e sem gastar "cem conto". Um MVP um pouco além do que existe, para o Demerval vender consultoria. O Luís faz o protótipo **sem banco de dados** (integração com IA e banco só quando um hospital disser "quero").
- **Cobrança:** o primeiro hospital vira o case (medir **antes × depois**). Nos próximos, cobra-se a integração ou um contrato com expectativa mínima de rentabilidade, em que as primeiras cirurgias pagam a integração. **"Taxímetro": receber por procedimento.**
- **Medir o ganho com o histórico**, por exemplo: antes, 10 cirurgias × 8 = 80; depois, 30 × 6 = 180. Também o tempo de liberação, o tempo de cirurgia etc.
- **Estrutura:** pensar o CNPJ. A Triwings entra com desenvolvimento e inteligência; o Demerval com know-how e vendas. Precisa de um case só "para fazer voar". "Oceano azul que a galera de software não está entrando."

---

## 7. Próximos passos combinados

1. Montar uma **apresentação** (PPT) do novo serviço, mostrando o que é preciso acessar e o que o hospital vai poder ver (segurança/transparência).
2. **Demerval** apresenta na **Santa Casa de Misericórdia do Recife** (comendador Irã). **Vini** busca um hospital em São Paulo; a **Rede Américas** é uma porta (e o Santa Joana Recife, que está implantando o MV).
3. **Checkpoint com o Demerval** antes de ele apresentar.
4. Luís valida com o Demerval quais dados importam e, com o Vini, compõe o resto da visão. Grupo "OPMEIA" criado.
5. O Álvaro traz algo estruturado; reunião na sexta, depois do CONAP. Próximas reuniões mais cedo, para a Verônica conseguir participar.

---

## 8. O que isso muda no protótipo SolicitaCirurg (leitura do Luís/Claude)

> **Decisão final (14/10/2026):** o complemento médico **existe**. É fixo por procedimento, vem do contrato médico–hospital e é pago se o pedido seguir o padrão; fora do padrão, o médico perde o complemento. Ver a [especificação](../superpowers/specs/2026-10-14-plataforma-unificada-design.md).

- **O honorário complementar é VALOR FIXO por procedimento contratado, não percentual.** É o valor que completa a diferença entre o que a operadora paga e a expectativa do médico (8–15 mil), condicionado a seguir o protocolo e usar homologados. O modelo atual (proporção % do ganho por item, faixas A/B/C) não reflete o caso real.
- **O médico pede o procedimento, não o produto.** A tela ideal é um "cardápio do procedimento", com o material definido pelo hospital dentro do leque aceito pelos médicos.
- **Nova alavanca: a codificação.** Mostrar ao médico quanto ele receberia pedindo o código correto, com base no histórico da operadora.
- **Previsibilidade do médico:** "neste hospital, este procedimento pelo plano X paga no mínimo R$ Y", somando operadora + complemento.
- **Leque do GME:** padronizar N aceitos → direcionar para os 3 mais rentáveis.
- **Consultoria:** curva ABC de procedimentos, KPIs por setor (regulação, compras, financeiro), prazos e caixa, antes × depois.
- **A tela do médico deve convidá-lo a participar, não tratá-lo como infrator.**
