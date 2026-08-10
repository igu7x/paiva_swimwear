-- Cria a linha única de configuração da loja, com os valores reais.
--
-- Esta migração roda uma vez só. Daqui pra frente, mudar cidade, WhatsApp ou
-- valor da entrega é pela tela do painel, não mexendo neste arquivo.
--
-- O WhatsApp fica gravado só com números e COM o código do país (55) na frente.
-- É o formato que o link wa.me espera, e guardar o 55 explícito evita ter que
-- adivinhar depois — ver `linkWhatsApp` em src/lib/formato.ts.
--
-- frete_centavos é o valor da entrega EM CENTAVOS: R$ 15,00 = 1500.
-- Zero significa "a combinar": a tela mostra que o frete é combinado pelo
-- WhatsApp em vez de somar um valor no total. Quando ela definir um preço fixo
-- no painel, a linha passa a aparecer normalmente no pedido.

INSERT INTO "config_loja" ("id", "nome_loja", "cidade", "whatsapp", "frete_centavos")
VALUES (1, 'Paiva Swimwear', 'Goiânia', '5562999802030', 0)
ON CONFLICT ("id") DO NOTHING;
