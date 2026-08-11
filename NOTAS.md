# Onde paramos

> Registro de sessão. A mais recente fica no topo. Serve para você voltar dias
> depois e retomar sem precisar lembrar de nada.

---

## Sessão 7 — 10/08/2026 — Vitrine e página da peça

### ⚠️ MUDANÇA DE RUMO: o WhatsApp saiu do site

O Igor definiu que **o site é completo, para a cliente e para a vendedora, e o
WhatsApp não entra nele**. Isso contraria o `CLAUDE.md`, que descreve o
WhatsApp como rede de segurança do negócio ("ela sempre tem que conseguir
combinar por WhatsApp como faz hoje") e define a Etapa 2 como "mandar o link de
um produto no WhatsApp em vez de foto solta".

Decisão dele, registrada aqui para não ser desfeita por engano.

**Consequência:** enquanto a Etapa 3 não existir, a cliente escolhe cor e
tamanho e o caminho termina ali — não há como comprar. A página mostra o que
ela escolheu e avisa que o pedido vem em breve. Nenhum botão falso.

O campo `whatsapp` continua na configuração da loja: é o contato do negócio e
serve para a tela de entregas mais adiante.

### O que ficou pronto

**Vitrine em `/`** — grade de duas colunas no celular, foto ocupando quase tudo,
nome e preço pequenos embaixo. Peça sem estoque aparece marcada como esgotada
em vez de sumir: quem recebeu o link não pode cair numa página inexistente.

**Página da peça em `/<slug>`** — galeria que troca conforme a cor escolhida,
tamanhos com o que acabou riscado, tabela de medidas embutida e a descrição
virando lista (uma linha por característica, como ela escreve nas artes).

**Prévia do link** — `generateMetadata` com título, preço e a foto de capa.
É o que faz o link chegar com imagem quando colado em qualquer lugar.

**Se a cor escolhida não tem foto própria**, a galeria mostra as fotos da peça.
Melhor a foto genérica do que espaço vazio.

### O que falta na Etapa 2

Nada. A Etapa 2 está fechada assim que as peças reais forem cadastradas.

---

## Sessão 6 — 10/08/2026 — Fotos das peças

### PRIMEIRO PASSO, MANUAL E UMA VEZ SÓ

Rodar `supabase/storage.sql` no painel do Supabase (_SQL Editor > New query >
colar > Run_). Ele cria o balde `produtos` e as regras de permissão. **Nada de
foto funciona antes disso.**

Não está junto das migrações de propósito: elas rodam também no Postgres da
máquina, onde o Storage do Supabase não existe, e quebrariam.

### Decisões

**Quem autoriza o envio é a sessão da vendedora**, não uma chave mestra. As
regras ficam no Storage: quem está logado grava, qualquer um lê. Isso dispensou
a chave `service_role` — aquela que ignora todas as travas do banco. Uma chave
secreta a menos circulando, e quem confere a permissão passa a ser o Supabase.

**As fotos de teste vão para a pasta `dev/`.** O Storage é um só, e separar por
pasta resolve sem custar um projeto inteiro a mais. `VERCEL_ENV` decide: só o
site publicado de verdade grava fora de `dev/`.

**O nome do arquivo termina com um trecho aleatório.** Duas fotos "IMG_0042.jpg"
não se atropelam, e trocar a foto gera endereço novo — então o navegador da
cliente mostra a nova em vez da antiga que ele guardou.

### Como ficou para ela

Escolher os arquivos já envia, sem botão de confirmar depois. Cada peça tem
fotos próprias (capa, arte com modelo) e cada cor tem as suas. A primeira foto
da peça é marcada como capa, porque é a que vai para a vitrine e para a prévia
do link no WhatsApp.

### O que falta na Etapa 2

1. Vitrine e página da peça, com o visual aprovado
2. Tela "qual é o meu tamanho", com as medidas que já estão em
   `src/lib/tamanhos.ts`

---

## Sessão 5 — 10/08/2026 — Desempenho e movimento

### A lição: medir antes de consertar

Errei duas vezes por supor. O que resolveu foi entrar no painel de produção
com o login da vendedora e cronometrar cada tela. **Antes de mexer em
desempenho aqui, meça.**

O achado que destravou tudo: `/admin/produtos/nova` é um formulário vazio, não
toca no banco, e custava 407ms. Isso provou que o problema não era o banco nem
a animação.

### Números em produção, medidos

| Tela                   | Antes | Depois |
| ---------------------- | ----- | ------ |
| `/` vitrine            | 430ms | 25ms   |
| `/admin/produtos/nova` | 407ms | 212ms  |
| `/admin/produtos`      | 488ms | 296ms  |
| `/admin`               | 567ms | 416ms  |

### O que causava, e o que foi feito

**A vitrine consultava o banco a cada visita.** Agora fica guardada pronta e se
refaz quando o painel muda o catálogo (`revalidatePath`). A renovação de 1
minuto é só rede de segurança.

**O painel perguntava três vezes por visita se o login valia**, pela rede: no
proxy, no layout e na tela. Viraram duas (`cache()` do React) e depois zero
viagens: o login é ES256, assimétrico, então a assinatura é conferida
localmente com a chave pública (`src/lib/supabase/chaves.ts`). Em troca, uma
sessão encerrada vale até o token vencer — no máximo uma hora.

**O proxy rodava no site inteiro**, inclusive nas telas da cliente, que não têm
sessão. Agora só em `/admin`.

**Não havia movimento nenhum.** Foram acrescentados: encolher ao pressionar,
aro girando ao salvar, bolinha no link (só depois de 120ms), entrada de
conteúdo, esqueleto pulsando em cascata e troca de tela deslizando (ida para a
esquerda, volta para a direita) com o cabeçalho ancorado. Tudo instantâneo para
quem liga "reduzir movimento".

**Os links buscam a tela inteira antes do clique** (`prefetch`). O padrão só
buscava o esqueleto de carregamento.

### O que sobrou, se voltar ao assunto

- ~160ms por tela do painel que não são login nem banco: é a Vercel acordar a
  função e montar a página. Só sumiria com o painel virando aplicação de tela.
- `/admin` em 416ms faz duas consultas ao banco. O *transaction pooler* (porta
  6543) conecta mais rápido em servidor deste tipo — é trocar a variável na
  Vercel, sem código.
- A chave pública fica em cache por instância; instância nova paga uma busca.

### Pendências de segurança

**Trocar a senha do banco E a senha da conta da vendedora** —
`mariacpaiva@gmail.com`. As duas passaram pelo chat.

---

## Sessão 4 — 10/08/2026 — Etapa 2: cadastro de peças

### Direção visual aprovada: "sol e areia"

Tirada da logo e das artes da própria loja, não inventada. Está em
`src/app/globals.css`:

| Papel            | Cor       |                                          |
| ---------------- | --------- | ---------------------------------------- |
| Fundo            | `#faf4ea` | o areia das artes da marca               |
| Texto            | `#4a3626` | marrom escuro, não preto                 |
| Texto secundário | `#786652` | escolhido para passar em contraste       |
| Bordas           | `#e9decb` |                                          |
| Dourado          | `#e0a11b` | **detalhe apenas**, nunca texto corrido  |

Títulos em **Playfair Display** (serifada de contraste alto, próxima da logo),
textos em **Jost**. As duas servidas do nosso endereço pelo `next/font` — a
página não espera servidor de fora, e nada da cliente vai para o Google.

Descartadas: "foto manda em tudo" (neutra demais para a marca) e "sol forte"
(os blocos de amarelo das artes antigas brigam com a elegância da logo).

### O que a marca respondeu

- **Conjunto sai todo no mesmo tamanho.** Está escrito na tabela de tamanhos
  dela. Isso encerra a dúvida que estava marcada para reavaliar na Etapa 3.
- Tamanhos reais: **P, M, G, GG**, com medidas de quadril e busto já em
  `src/lib/tamanhos.ts`, prontas para a tela de "qual é o meu tamanho".
- Bronzeador nas artes é só cenário, não é vendido.
- As artes de produto antigas (blocos de amarelo) e a arte nova com a logo são
  duas linguagens visuais diferentes. Seguimos a nova.

### O que já está pronto

- `/admin/produtos` — lista com estoque somado e aviso de peça zerada
- `/admin/produtos/nova` — cadastro: nome, preço, descrição, aparecer na loja
- `/admin/produtos/[id]` — edição, cores e a grade de estoque por tamanho
- Preço aceita "99", "99,00", "R$ 99,00" e "1.299,90"
- Link da peça sai do nome: "Biquíni Asa Delta" → `/biquini-asa-delta`
- Testado contra o banco de verdade: 13 verificações, incluindo as travas de
  preço zero, estoque negativo, cor repetida e foto apontando para cor de outro
  produto. O teste roda em transação desfeita, não suja o banco.

### O que falta na Etapa 2

1. **Fotos.** Precisa da chave `service_role` do Supabase no `.env.local` e na
   Vercel — é ela que autoriza gravar arquivo no Storage. Nunca pode ir para o
   Git nem aparecer no navegador.
2. **Vitrine e página da peça** com o visual aprovado.
3. Tela de "qual é o meu tamanho" usando as medidas.

### Pendência de segurança que continua aberta

**A senha do banco não foi trocada** — o `.env.local` está com a que passou pelo
chat. _Project Settings > Database > Reset database password_, e depois atualizar
o `.env.local` **e** a variável na Vercel.

---

## Sessão 3 — 10/08/2026 — Banco no ar

### ⚠️ O VPN do trabalho bloqueia o banco

Se `npm run db:migrate` ou o site local travar com `CONNECT_TIMEOUT`, **a causa
quase certa é o GlobalProtect ligado**. Desconecte e tente de novo.

O diagnóstico já foi feito por completo, não precisa refazer: DNS resolve, a
porta 5432 abre em 35ms e o projeto responde por HTTPS — mas a conversa do
Postgres trava sem resposta. O adaptador `PANGP Virtual Ethernet Adapter`
(rede `tjgo.gov`) deixa passar navegação e descarta tráfego de banco. Não é
SSL, não é o endereço do pooler e não é o Supabase.

Isso atrapalha só o desenvolvimento nesta máquina. Na Vercel a rede é outra.

### Valores gravados na configuração da loja

| Campo    | Valor           | Observação                                          |
| -------- | --------------- | --------------------------------------------------- |
| Nome     | Paiva Swimwear  |                                                     |
| Cidade   | Goiânia         |                                                     |
| WhatsApp | `5562999802030` | Só números, com o 55 na frente. `wa.me/5562999802030` |
| Entrega  | `0` centavos    | **Zero significa "a combinar"**, como é hoje.        |

Ela muda os quatro pelo painel; o arquivo de migração não é mexido de novo.

### Conferido, funcionando

- Banco: 5 tabelas, **todas com RLS ligado e zero políticas** (ninguém acessa
  de fora, só o nosso servidor). 3 migrações registradas.
- Vitrine em `/` lendo o banco e mostrando o nome da loja e a cidade.
- `/admin` sem login redireciona (307) para `/admin/login`. Proteção ok.
- Formulário de login com os campos de e-mail e senha.

### Pendência de segurança

**A senha do banco não foi trocada.** O `.env.local` está com a senha que passou
pelo chat. Trocar em _Project Settings > Database > Reset database password_,
atualizar o `.env.local` e, quando existir, a variável na Vercel.

---

## Sessão 2 — 10/08/2026 — GitHub fechado, modelo do catálogo

### Decisões tomadas

| Decisão                        | Escolha                                                     | Observação                                                                       |
| ------------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Autoria de IA nos commits      | Proibida, com três travas                                    | Ver seção abaixo. Regra no `AGENTS.md` + hook que recusa o commit.                |
| Branch principal               | `main` (era `master`)                                        | Renomeada antes do primeiro push.                                                 |
| E-mail do Git                  | Pessoal, configurado **só neste projeto**                    | Global segue com o do trabalho, para os repositórios do TJGO.                     |
| Como a peça varia              | **Uma variação só**, de nome livre, com fotos próprias        | "Preto" e "Onda Coral" são a mesma ideia. Evita cadastro de dois eixos.           |
| Onde fica o preço              | No produto, não na variação                                  | Todas as estampas custam igual hoje. Se mudar, é uma coluna nova em `variacoes`.  |
| Onde ficam as fotos            | Na variação                                                  | A cliente precisa ver a estampa que escolheu.                                     |
| Lista de tamanhos              | Fixa no código (`src/lib/tamanhos.ts`), texto no banco       | Cadastro vira clique em vez de digitação; pedido antigo guarda o tamanho da época. |

### Sobre a regra de autoria de IA

Três camadas, porque memória sozinha não é garantia:

1. Memória do Claude Code (só minha, só neste projeto).
2. `AGENTS.md` — vale para qualquer agente e vai junto no Git.
3. `.githooks/commit-msg` — **recusa** o commit. Ativar numa máquina nova com
   `git config core.hooksPath .githooks`.

### O que já está pronto no código

- Tabelas do catálogo em `src/lib/db/schema.ts`: `produtos`, `variacoes`,
  `fotos`, `estoque` — com RLS ligado, cascata no apagar e as travas de preço
  positivo e estoque não negativo.
- Migração `drizzle/0002_catalogo.sql` gerada (**ainda não aplicada no banco**).
- `src/lib/tamanhos.ts` com a lista fixa e a ordenação correta.
- Typecheck e lint passando.

### O que FALTA (nesta ordem)

1. **Supabase** — criar o projeto (região São Paulo), preencher o `.env.local`,
   criar o usuário da vendedora em _Authentication > Users_.
2. **Valores reais** em `drizzle/0001_config_inicial.sql`: cidade, WhatsApp e
   valor da entrega. **Antes** de migrar — essa migração só roda uma vez.
3. `npm run db:migrate`.
4. **Vercel** — conectar o repositório, cadastrar as variáveis, publicar.
5. Só então: tela de cadastro de produto no painel.

### Próximo passo concreto

Criar o projeto no Supabase e preencher o `.env.local`.

### Ainda em aberto

- **Identidade visual** — sem isso não dá para propor a direção visual, e a
  vitrine de verdade não começa sem ela aprovada. Levantar com a vendedora:
  existe logo, paleta, tipografia? Praiano e colorido, minimalista e neutro, ou
  sensual e sofisticado? Quais marcas ela gosta?
- Existe opção de a cliente retirar em vez de receber? (afeta a Etapa 3)
- Confirmar: acompanhar o pedido por link secreto, sem senha nem cadastro.

---

## Sessão 1 — 10/08/2026 — Etapa 1: Fundação

### Decisões tomadas

| Decisão                     | Escolha                                                | Observação                                                              |
| --------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------- |
| Stack                       | Next.js 16 + TypeScript + Tailwind 4, tudo num projeto | Vitrine, painel e servidor juntos.                                       |
| Banco e fotos               | Supabase                                               | Postgres + armazenamento de imagem + login numa conta só.                |
| Acesso ao banco             | Drizzle                                                | Tabelas em TypeScript, consultas parecidas com SQL.                      |
| Login da vendedora          | E-mail e senha (Supabase Auth)                         | Uma conta só, criada à mão no painel do Supabase.                        |
| Publicação                  | Vercel, deploy a cada push na `main`                   |                                                                          |
| Como o biquíni é vendido    | Conjunto com um tamanho só, por enquanto               | **Reavaliar na parada da Etapa 3**, com dados reais de top/calcinha em tamanhos diferentes. |
| Pasta do projeto            | `C:\dev\paiva-swimwear`                                | Fora do OneDrive, que atrapalha projeto Node.                            |

### O que já está pronto no código

- Projeto Next.js criado, compilando e com build de produção passando.
- Conexão com o banco via Drizzle, com a tabela `config_loja` (nome, cidade,
  WhatsApp, valor da entrega) e as migrações escritas.
- Vitrine crua em `/` que lê os dados do banco — sem design ainda, de propósito.
- Login da vendedora em `/admin/login` e painel protegido em `/admin`.
- README com o manual de operação.

### O que FALTA para a Etapa 1 fechar

Nada disso é código — é a parte que só você pode fazer, criando as contas:

1. **GitHub** — criar o repositório e dar o primeiro push.
2. **Supabase** — criar o projeto (região São Paulo), copiar as chaves para o
   `.env.local`, e criar o usuário da vendedora em _Authentication > Users_.
3. **Antes de migrar** — abrir `drizzle/0001_config_inicial.sql` e trocar a
   cidade, o WhatsApp e o valor da entrega pelos valores reais.
4. **`npm run db:migrate`** — criar as tabelas.
5. **Vercel** — conectar ao repositório, cadastrar as mesmas variáveis de
   ambiente, publicar.
6. **Conferir no ar**: a vitrine abre e mostra o nome da loja; `/admin/login`
   aceita o e-mail e a senha; `/admin` abre o painel.

### Próximo passo concreto

Fazer os 6 itens acima. Quando o site estiver no ar e o login funcionando, a
Etapa 1 fecha.

### Perguntas em aberto (para a Etapa 2)

- Nome exato da loja, Instagram e domínio, se já existir.
- Cidade da loja e número de WhatsApp do negócio.
- **Identidade visual**: existe logo, paleta, tipografia? O estilo é mais
  praiano e colorido, minimalista e neutro, ou sensual e sofisticado? Quais
  marcas ela gosta? Sem isso não dá para propor a direção visual, e a direção
  visual precisa ser aprovada antes da vitrine de verdade.
- O que muda entre as peças: é **cor** ou é **estampa**? Estampa costuma ter
  fotos próprias, e isso muda o cadastro do produto.
- Existe opção de a cliente retirar em vez de receber?
- Confirmar: acompanhar o pedido por link secreto, sem senha nem cadastro.
