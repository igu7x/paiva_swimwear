/**
 * As duas chaves públicas do Supabase, com um erro legível se faltarem.
 *
 * Elas precisam ser lidas assim, escrevendo `process.env.NEXT_PUBLIC_...` por
 * extenso: o Next.js troca esse texto pelo valor real na hora de compilar, e
 * isso só funciona se o nome estiver escrito literalmente no código.
 */
export function ambienteSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chavePublica = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !chavePublica) {
    throw new Error(
      "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY. Copie o .env.example para .env.local e preencha.",
    );
  }

  return { url, chavePublica };
}
