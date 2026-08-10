/**
 * Cria o banco de desenvolvimento no Postgres da sua máquina.
 *
 *     npm run db:criar
 *
 * Roda uma vez, quando o projeto chega numa máquina nova. Se o banco já
 * existir, não faz nada e avisa — não apaga dado nenhum.
 *
 * O nome do banco sai do próprio DATABASE_URL do .env.local, para não existir
 * o nome escrito em dois lugares e eles discordarem um dia.
 */
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL não encontrada no .env.local.");
  process.exit(1);
}

if (url.includes(">>>") || url.includes("<<<")) {
  console.error(
    "O DATABASE_URL do .env.local ainda está com o modelo.\n" +
      "Troque >>>SENHA_DO_POSTGRES<<< pela senha do usuário postgres da sua máquina.",
  );
  process.exit(1);
}

if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
  // Trava de segurança: este script cria banco. Se o .env.local estiver
  // apontando para um servidor de fora por engano, ele para aqui.
  console.error(
    "Este comando só funciona com banco na sua máquina (localhost).\n" +
      "O DATABASE_URL do .env.local aponta para outro servidor — confira o arquivo.",
  );
  process.exit(1);
}

const nomeBanco = decodeURIComponent(new URL(url).pathname.slice(1));

// Para criar um banco é preciso estar conectado em OUTRO banco. O "postgres"
// existe em toda instalação e serve para isso.
const urlAdmin = url.replace(/\/[^/]+$/, "/postgres");
const sql = postgres(urlAdmin, { prepare: false, connect_timeout: 15 });

try {
  const existe = await sql`
    select 1 from pg_database where datname = ${nomeBanco}`;

  if (existe.length > 0) {
    console.log(`O banco "${nomeBanco}" já existe. Nada a fazer.`);
  } else {
    // Nome de banco não pode entrar como parâmetro, só interpolado. Por isso a
    // checagem de formato antes — sem ela, um nome estranho no .env.local
    // viraria comando SQL.
    if (!/^[a-z0-9_]+$/i.test(nomeBanco)) {
      throw new Error(`Nome de banco inválido: "${nomeBanco}"`);
    }
    await sql.unsafe(`create database "${nomeBanco}"`);
    console.log(`Banco "${nomeBanco}" criado.`);
  }

  console.log("\nPróximo passo:  npm run db:migrate");
} catch (erro) {
  console.error("Falhou:", erro.message);
  if (erro.code === "28P01") {
    console.error(
      "\nSenha do usuário postgres incorreta. Confira o DATABASE_URL no .env.local.",
    );
  }
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
