import "server-only";

import { obterDb } from "./index";
import { configLoja, type ConfigLoja } from "./schema";

/**
 * Lê a linha única de configuração da loja.
 *
 * Devolve `null` se ainda não existe — o que só acontece antes de rodar as
 * migrações. Quem chama decide o que mostrar nesse caso.
 */
export async function obterConfigLoja(): Promise<ConfigLoja | null> {
  const [config] = await obterDb().select().from(configLoja).limit(1);
  return config ?? null;
}
