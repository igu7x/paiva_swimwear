import { obterConfigLoja } from "@/lib/db/config-loja";
import { linkWhatsApp } from "@/lib/formato";

// Renderiza a cada visita, em vez de congelar o resultado na hora do build.
// Assim, mudar a configuração no banco reflete no site na hora. Quando o
// catálogo entrar, a gente troca isso por cache com invalidação — aí faz
// diferença de verdade no tempo de carregamento no celular.
export const dynamic = "force-dynamic";

/**
 * Vitrine da loja.
 *
 * Nesta etapa ela existe só para provar que o caminho inteiro funciona: o
 * navegador chama o servidor, o servidor lê o banco no Supabase, e o que
 * aparece na tela veio de lá. O catálogo entra na Etapa 2, e o visual de
 * verdade também.
 */
export default async function Home() {
  const config = await obterConfigLoja();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-suave)]">
        {config ? config.cidade : "Carregando"}
      </p>

      <h1 className="font-serif mt-3 text-4xl">
        {config ? config.nomeLoja : "Loja"}
      </h1>

      <p className="mt-6 text-[var(--color-suave)]">
        O catálogo está sendo montado. Em breve você vai ver todas as peças por
        aqui, com os tamanhos disponíveis.
      </p>

      {config ? (
        <a
          href={linkWhatsApp(
            config.whatsapp,
            "Oi! Vi o site e queria saber mais sobre as peças.",
          )}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--color-tinta)] px-6 py-3.5 text-sm font-medium text-[var(--color-areia)]"
        >
          Falar no WhatsApp
        </a>
      ) : null}

      <p className="mt-12 border-t border-[var(--color-linha)] pt-6 text-xs text-[var(--color-suave)]">
        Entregas em {config?.cidade ?? "nossa cidade"}.
      </p>
    </main>
  );
}
