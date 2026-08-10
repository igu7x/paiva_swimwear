import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Conexão com o banco.
 *
 * O `import "server-only"` na primeira linha é uma trava: se algum dia este
 * arquivo for importado por engano dentro de um componente que roda no
 * navegador, o build quebra na hora em vez de vazar a senha do banco para a
 * tela da cliente.
 *
 * A conexão é aberta na primeira consulta, e não quando o arquivo é carregado.
 * Isso importa: durante o build, o Next.js carrega todos os arquivos para
 * descobrir as rotas, e abrir banco nessa hora só cria problema.
 */

// Em desenvolvimento o Next.js recarrega os arquivos a cada mudança. Sem este
// cache, cada recarga abriria uma conexão nova e o banco acabaria recusando
// conexões depois de alguns minutos editando código.
const globalParaDb = globalThis as unknown as {
  dbPaiva?: PostgresJsDatabase<typeof schema>;
};

function conectar(): PostgresJsDatabase<typeof schema> {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL não está definida. Copie o .env.example para .env.local e preencha a conexão do Supabase.",
    );
  }

  const cliente = postgres(url, {
    // Desliga "prepared statements". Não são compatíveis com o modo de conexão
    // compartilhada do Supabase, e deixar desligado é o que nos permite trocar
    // de porta lá no futuro sem quebrar nada aqui.
    prepare: false,
  });

  return drizzle(cliente, { schema });
}

/** O banco. Use sempre por aqui: `const db = obterDb()`. */
export function obterDb(): PostgresJsDatabase<typeof schema> {
  if (!globalParaDb.dbPaiva) {
    globalParaDb.dbPaiva = conectar();
  }
  return globalParaDb.dbPaiva;
}
