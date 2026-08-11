import { ambienteSupabase } from "./ambiente";

/**
 * Onde as fotos das peças ficam guardadas.
 *
 * O balde e as regras de permissão são criados uma vez pelo supabase/storage.sql.
 */

export const BALDE = "produtos";

/**
 * Separa o que você sobe testando do que é da loja de verdade.
 *
 * As fotos de teste vão para dentro de `dev/`, então nunca aparecem misturadas
 * às reais. É a mesma ideia da separação do banco, só que aqui feita por pasta:
 * o Storage é um só, e não vale um projeto inteiro a mais só por causa disso.
 *
 * `VERCEL_ENV` só vale "production" no site publicado de verdade. Na sua
 * máquina ela não existe, e nas publicações de teste da Vercel ela vale
 * "preview" — os dois caem em `dev/`, que é o certo.
 */
export function prefixoDoAmbiente(): string {
  return process.env.VERCEL_ENV === "production" ? "" : "dev/";
}

/**
 * Monta o caminho do arquivo dentro do balde.
 *
 * O nome termina com um trecho aleatório de propósito. Duas razões: duas fotos
 * chamadas "IMG_0042.jpg" não se atropelam, e trocar a foto de uma peça gera um
 * endereço novo — então o navegador da cliente mostra a nova em vez de continuar
 * exibindo a antiga que ele guardou.
 */
export function caminhoDaFoto(
  slug: string,
  variacaoId: number | null,
  extensao: string,
): string {
  const pasta = variacaoId ? `cor-${variacaoId}` : "peca";
  const sorteio = crypto.randomUUID().slice(0, 8);
  return `${prefixoDoAmbiente()}${slug}/${pasta}/${sorteio}.${extensao}`;
}

/** O endereço público da imagem, para usar no `src` da tela. */
export function enderecoDaFoto(caminho: string): string {
  const { url } = ambienteSupabase();
  return `${url}/storage/v1/object/public/${BALDE}/${caminho}`;
}

/** As extensões que aceitamos, casadas com o que o balde permite. */
export const TIPOS_ACEITOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const TAMANHO_MAXIMO = 8 * 1024 * 1024;
