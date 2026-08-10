# Onde paramos

> Registro de sessão. A mais recente fica no topo. Serve para você voltar dias
> depois e retomar sem precisar lembrar de nada.

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
