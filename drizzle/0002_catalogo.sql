CREATE TABLE "estoque" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "estoque_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"variacao_id" integer NOT NULL,
	"tamanho" text NOT NULL,
	"quantidade" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "estoque_tamanho_por_variacao" UNIQUE("variacao_id","tamanho"),
	CONSTRAINT "estoque_quantidade_nao_negativa" CHECK ("estoque"."quantidade" >= 0)
);
--> statement-breakpoint
ALTER TABLE "estoque" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "fotos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fotos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"variacao_id" integer NOT NULL,
	"caminho" text NOT NULL,
	"posicao" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fotos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "produtos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "produtos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	"descricao" text DEFAULT '' NOT NULL,
	"preco_centavos" integer NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "produtos_slug_unique" UNIQUE("slug"),
	CONSTRAINT "produtos_preco_positivo" CHECK ("produtos"."preco_centavos" > 0)
);
--> statement-breakpoint
ALTER TABLE "produtos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "variacoes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "variacoes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"produto_id" integer NOT NULL,
	"nome" text NOT NULL,
	"posicao" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "variacoes_nome_por_produto" UNIQUE("produto_id","nome")
);
--> statement-breakpoint
ALTER TABLE "variacoes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_variacao_id_variacoes_id_fk" FOREIGN KEY ("variacao_id") REFERENCES "public"."variacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_variacao_id_variacoes_id_fk" FOREIGN KEY ("variacao_id") REFERENCES "public"."variacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variacoes" ADD CONSTRAINT "variacoes_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;