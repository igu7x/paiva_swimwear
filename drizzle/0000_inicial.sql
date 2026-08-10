CREATE TABLE "config_loja" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"nome_loja" text NOT NULL,
	"cidade" text NOT NULL,
	"whatsapp" text NOT NULL,
	"frete_centavos" integer DEFAULT 0 NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "config_loja_linha_unica" CHECK ("config_loja"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE "config_loja" ENABLE ROW LEVEL SECURITY;