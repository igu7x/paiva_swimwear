# PROJETO — Loja de biquínis online

Este documento explica **o que estamos construindo e por quê**. Ele não define
tecnologia, arquitetura nem estrutura de código — essas decisões são suas, e eu quero
ouvir suas propostas antes de você executá-las.

---

## Como quero trabalhar com você

Isto é uma conversa, não uma especificação pra você executar sozinho.

**Pergunte antes de assumir.** Sempre que um detalhe estiver ambíguo, faltando ou
tiver mais de um caminho razoável, pare e me pergunte. Prefiro responder dez perguntas
agora do que descobrir daqui a duas semanas que você adivinhou errado. Uma suposição
silenciosa custa uma sessão inteira de trabalho; uma pergunta custa trinta segundos.

**Proponha e espere meu OK** nas decisões que moldam o projeto: escolha de tecnologia,
organização do sistema, modelo de dados, direção visual. Me explique as opções em
linguagem simples, com o que você recomendaria e por quê. Eu decido, você executa.

**Vá em pedaços pequenos.** Eu trabalho e estudo, então avanço em sessões curtas de
uma ou duas horas, algumas vezes por semana. Entregue coisas que cabem nesse tamanho e
que funcionam de ponta a ponta. Não despeje o projeto inteiro de uma vez.

**Me ajude a retomar o contexto.** No fim de cada sessão, me deixe registrado onde
paramos e qual é o próximo passo concreto. Eu volto dias depois sem lembrar de nada.

Sou desenvolvedor, estudo inteligência artificial e programo bastante com IA, mas não
sou especialista em arquitetura. Explique suas escolhas de um jeito que eu aprenda com
elas — quero entender o sistema, não só recebê-lo pronto.

---

## O negócio

Uma loja pequena de biquínis, tocada por uma pessoa, que hoje vende **inteiramente
pelo WhatsApp**.

O fluxo atual é todo manual e todo em conversa: ela manda fotos soltas das peças, a
cliente pergunta preço e tamanho, o pagamento é combinado ali mesmo, o endereço vem em
texto no meio do papo, e o pedido é anotado num caderno ou fica na memória.

Os problemas disso são concretos:

- Não existe catálogo, então cada conversa recomeça do zero mandando as mesmas fotos
- Ela vende tamanho que já acabou, porque o estoque só existe na cabeça dela
- Pedido se perde no meio de dezenas de conversas simultâneas
- Não dá pra saber o que vendeu no mês nem quais peças saem mais
- Na hora de entregar, os endereços estão espalhados por várias conversas

**O que vamos construir:** um site próprio da loja, com catálogo, carrinho, pedido,
pagamento online e um painel para ela administrar produtos, estoque e entregas.

---

## Quem usa

**A vendedora.** Uma pessoa só, que faz quase tudo pelo celular e não é técnica.
Precisa cadastrar uma peça com foto rapidamente, enxergar quanto tem de cada tamanho,
e ver os pedidos do dia para separar e entregar. Se qualquer tarefa exigir muitos
passos, ela volta pro caderno. Simplicidade aqui não é preferência estética, é o que
determina se o sistema vai ser usado ou abandonado.

**A cliente.** Chega por um link mandado no WhatsApp ou vindo do Instagram. Está no
celular, às vezes com internet ruim. Quer ver as peças, escolher o tamanho e pagar.
**Não existe cadastro nem login de cliente** — qualquer fricção a mais e ela desiste e
volta a perguntar por mensagem.

---

## Escala real

Dezenas de produtos. Algumas dezenas de pedidos por mês. Uma única pessoa no painel.

Isso não é um marketplace e não vai virar um tão cedo. Não construa para uma escala
que não existe: prefira sempre a solução simples e direta à solução "preparada para
crescer". Se em algum momento você achar que vale antecipar complexidade, me convença
antes.

---

## O que o sistema precisa fazer

**Catálogo.** Ela cadastra as peças com fotos, descrição, preço e os tamanhos e cores
disponíveis, com a quantidade de cada combinação. As clientes veem uma vitrine e a
página de cada peça.

**Estoque por tamanho e cor.** Essa é a parte que mais importa pra ela. O controle não
é por produto, é por combinação: "Biquíni Marina, tamanho M, preto" tem duas unidades.
Quando acaba, a cliente precisa ver que acabou, sem conseguir comprar.

**Pedido.** A cliente escolhe as peças, informa nome, telefone e endereço de entrega, e
fecha o pedido. Ela precisa conseguir acompanhar o status depois, sem criar conta.

**Pagamento.** Feito pela **InfinitePay**, que é a conta que a loja já usa. Existe um
checkout integrado deles que gera link de pagamento — busque a documentação oficial
atualizada antes de implementar, porque isso muda com o tempo. Aceita Pix e cartão.

**Entrega.** Só na cidade da loja, feita pelos próprios donos, de carro. Não há
transportadora, cálculo por CEP, rastreio nem integração com Correios. O valor da
entrega é fixo e ela precisa poder alterá-lo. Ela precisa de uma tela que mostre as
entregas do dia com os endereços, pra montar a rota.

**Acompanhamento do que ela vende.** Bem simples: quanto vendeu no mês, o que sai mais,
o que está acabando no estoque.

---

## Regras que não podem ser quebradas

Não são detalhes técnicos, são regras do negócio:

- **Preço é sempre decidido pelo servidor**, nunca aceito do que veio da tela da
  cliente. Não quero descobrir alguém comprando um biquíni por um real.
- **A peça só sai do estoque quando o pagamento é confirmado**, não quando entra no
  carrinho. Carrinho abandonado não pode segurar mercadoria que outra pessoa compraria.
- **Um pedido antigo tem que continuar mostrando o preço que foi cobrado na época.**
  Se ela reajustar o preço em março, o pedido de janeiro não pode mudar de valor.
- **Confirmação de pagamento tem que ser confiável mesmo se a cliente fechar a aba** no
  meio do processo. Isso vai acontecer, e mais de uma vez.
- **A loja precisa continuar funcionando se algo der errado no pagamento.** Ela sempre
  tem que conseguir combinar por WhatsApp como faz hoje.

---

## O que está fora de escopo

**Um agente de IA no WhatsApp.** Existe um plano futuro de criar um agente que conversa
com a cliente, coleta os dados e cria o pedido sozinho dentro deste sistema. Esse plano
é real e vai acontecer — mas **só depois que tudo descrito aqui estiver no ar,
funcionando e validado com clientes reais por várias semanas.**

Enquanto isso: nada de biblioteca de WhatsApp, nada de integração com modelo de
linguagem, nada de estrutura criada "pra facilitar quando o agente chegar". Se você
achar que alguma decisão de hoje deveria levar o agente em conta, **me pergunte** em
vez de decidir sozinho.

Também estão fora, por enquanto: cupom de desconto, avaliação de produto, lista de
desejos, múltiplos vendedores, venda para fora da cidade e aplicativo nativo.

---

## Ordem de construção

Quero avançar em etapas onde cada uma termina **no ar e funcionando**, e cada uma já
traz algum valor real, mesmo que pequeno. Nunca começar a próxima com a anterior
quebrada.

A ordem que faz sentido pra mim:

1. **Fundação** — o mínimo no ar, com deploy funcionando desde o começo.
2. **Catálogo** — ela cadastra as peças e consegue mandar o link de um produto no
   WhatsApp em vez de foto solta. Só isso já melhora o dia dela.
3. **Pedido, ainda sem pagamento online** — a cliente fecha o pedido no site e o
   pagamento continua sendo combinado na conversa, como hoje.
4. **Pagamento pela InfinitePay.**
5. **Painel de pedidos e tela de entregas do dia.**
6. **Números simples de venda e estoque.**

Se você achar que essa ordem tem algum problema, me diga — está aberta a discussão.

**Uma parada importante:** quando terminarmos a etapa 3, vamos **parar de desenvolver
e usar o sistema de verdade por duas ou três semanas** com clientes reais. O que a
gente aprender nesse período provavelmente muda as etapas seguintes, e prefiro
descobrir isso antes de construir em cima de suposição. Não siga para a etapa 4 sem eu
te avisar.

---

## Sobre a aparência

O público é feminino, o produto é totalmente visual e a compra acontece no celular.
Então: **pensado para o celular primeiro**, com o desktop como caso secundário, e com a
foto da peça sendo a protagonista da tela.

Antes de construir a parte que as clientes veem, **me proponha uma direção visual** e
espere meu retorno. Fuja tanto do visual genérico de template de loja quanto daquela
cara padronizada de coisa gerada por IA. Quero algo que combine com esta loja
especificamente — me pergunte sobre a identidade da marca, que eu levanto com ela.

Os textos da interface em português do Brasil, simples e diretos, sem enrolação.

---

## Por onde começar

Não comece a codar ainda.

Leia isto tudo, me diga o que ficou ambíguo ou faltando, e me faça as perguntas que
você precisa pra propor a stack e a organização do projeto. Quando eu aprovar, aí sim
a gente começa pela fundação.
