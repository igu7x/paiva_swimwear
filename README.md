# Paiva Swimwear

Loja online de biquínis. O porquê do projeto, quem usa e as regras de negócio
estão no [CLAUDE.md](./CLAUDE.md) — leia ele primeiro. Este arquivo é só o
manual de operação do código.

## O que tem aqui

| Peça             | Escolha              | Por quê                                                                 |
| ---------------- | -------------------- | ----------------------------------------------------------------------- |
| Site e servidor  | Next.js 16 + React 19 | Vitrine, painel e servidor no mesmo projeto. O preço é decidido no servidor por padrão. |
| Estilo           | Tailwind CSS 4       | Estilo escrito junto do HTML, sem arquivo de CSS crescendo sem controle. |
| Banco            | Postgres no Supabase | Banco relacional de verdade, com painel visual para olhar os dados.      |
| Acesso ao banco  | Drizzle              | As tabelas são descritas em TypeScript e as consultas parecem SQL.       |
| Login do painel  | Supabase Auth        | E-mail e senha, sessão em cookie, sem a gente guardar senha de ninguém.  |
| Publicação       | Vercel               | Todo push na branch `main` publica sozinho.                              |

## Rodando na sua máquina

```bash
npm install
cp .env.example .env.local   # depois preencha os valores
npm run db:migrate           # cria as tabelas no Supabase
npm run dev                  # http://localhost:3000
```

- Vitrine: `http://localhost:3000`
- Painel: `http://localhost:3000/admin`

## Comandos

| Comando               | O que faz                                                    |
| --------------------- | ------------------------------------------------------------ |
| `npm run dev`         | Sobe o site localmente, recarregando a cada arquivo salvo.    |
| `npm run build`       | Faz o build de produção. Rode antes de subir, para pegar erro. |
| `npm run typecheck`   | Confere os tipos sem gerar build. É rápido.                   |
| `npm run lint`        | Confere padrões de código.                                    |
| `npm run db:generate` | Depois de mudar `src/lib/db/schema.ts`, escreve o `.sql`.     |
| `npm run db:migrate`  | Aplica os `.sql` pendentes no banco.                          |
| `npm run db:studio`   | Abre uma tela para navegar nos dados do banco.                |

## Como mudar o banco de dados

Sempre nesta ordem — nunca mexa nas tabelas pelo painel do Supabase, senão o
código e o banco saem de sincronia e ninguém descobre até quebrar:

1. Edite `src/lib/db/schema.ts`.
2. `npm run db:generate` — o Drizzle escreve um arquivo novo em `drizzle/`.
3. Leia o `.sql` gerado. É o que vai rodar no banco de verdade.
4. `npm run db:migrate`.
5. Faça commit do schema **e** do `.sql` juntos.

Migrações são rodadas por você, da sua máquina. A publicação na Vercel não roda
migração — assim nenhuma mudança de banco acontece sem alguém olhando.

## Como o código está organizado

```
src/
  app/
    page.tsx                    vitrine (o que a cliente vê)
    admin/
      login/                    tela de login (aberta, sem trava)
      (painel)/                 tudo aqui exige estar logado
    layout.tsx                  moldura de todas as páginas
    globals.css                 base visual provisória
  lib/
    db/
      schema.ts                 as tabelas, em TypeScript
      index.ts                  a conexão
      config-loja.ts            leitura da configuração da loja
    supabase/
      servidor.ts               quem está logado
      sessao-proxy.ts           renovação do cookie de login
      ambiente.ts               leitura das chaves públicas
    formato.ts                  dinheiro em reais, link de WhatsApp
  proxy.ts                      roda antes de toda página
drizzle/                        as migrações .sql, em ordem
```

## Decisões que valem lembrar

- **Dinheiro é inteiro, em centavos.** R$ 189,90 é `18990`. Número decimal em
  computador não é exato, e isso vira centavo faltando no pedido.
- **Toda tabela liga RLS.** O Supabase publica as tabelas numa API pública
  automaticamente. RLS ligado e sem políticas significa "só o nosso servidor
  entra". Toda tabela nova precisa de `.enableRLS()`.
- **A trava do painel está no layout, não no proxy.** O `src/proxy.ts` só renova
  o cookie de login. Quem barra o acesso é `src/app/admin/(painel)/layout.tsx`,
  dentro da aplicação, onde não tem como desviar.
- **Textos em português do Brasil**, e nomes de variáveis e funções em português
  também, para o código conversar com o CLAUDE.md sem tradução no meio.

## Segredos

Nunca comite `.env.local`. As chaves de produção ficam na Vercel, em
_Settings > Environment Variables_. Se alguma vazar, dá para trocar no painel do
Supabase sem mexer no código.

`npm audit` aponta um aviso no `drizzle-kit`. É uma ferramenta que só roda no seu
terminal, nunca no site publicado, e o aviso é sobre o servidor de
desenvolvimento dela. Não afeta a loja.
