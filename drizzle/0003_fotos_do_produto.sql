-- Foto passa a pertencer ao PRODUTO, e opcionalmente a uma cor.
--
--   variacao_id preenchido -> foto daquela cor
--   variacao_id vazio      -> foto do produto: capa, arte com modelo, detalhe
--
-- A ORDEM DOS COMANDOS ABAIXO IMPORTA e foi corrigida à mão. O drizzle-kit
-- gerou a chave estrangeira composta ANTES da restrição de unicidade que ela
-- referencia, e o Postgres recusa: uma chave estrangeira só pode apontar para
-- colunas que já sejam garantidamente únicas. Se regerar esta migração, confira
-- se a unicidade em "variacoes" continua vindo primeiro.

--> statement-breakpoint
ALTER TABLE "variacoes" ADD CONSTRAINT "variacoes_id_com_produto" UNIQUE("id","produto_id");--> statement-breakpoint

ALTER TABLE "fotos" DROP CONSTRAINT "fotos_variacao_id_variacoes_id_fk";--> statement-breakpoint
ALTER TABLE "fotos" ALTER COLUMN "variacao_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "fotos" ADD COLUMN "produto_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_variacao_do_mesmo_produto" FOREIGN KEY ("variacao_id","produto_id") REFERENCES "public"."variacoes"("id","produto_id") ON DELETE cascade ON UPDATE no action;
