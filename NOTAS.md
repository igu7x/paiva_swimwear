# Onde paramos

> Registro de sessão. A mais recente fica no topo. Serve para você voltar dias
> depois e retomar sem precisar lembrar de nada.

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
