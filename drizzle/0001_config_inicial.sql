-- Cria a linha única de configuração da loja.
--
-- ⚠️ ANTES DE RODAR `npm run db:migrate`, troque os valores abaixo pelos reais.
-- Depois que esta migração rodar uma vez, ela não roda de novo — mudanças
-- futuras nesses valores serão feitas pela tela do painel.
--
-- frete_centavos é o valor da entrega EM CENTAVOS: R$ 15,00 = 1500.

INSERT INTO "config_loja" ("id", "nome_loja", "cidade", "whatsapp", "frete_centavos")
VALUES (1, 'Paiva Swimwear', 'TROQUE PELA CIDADE', '00000000000', 0)
ON CONFLICT ("id") DO NOTHING;
