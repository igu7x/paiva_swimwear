import Image from "next/image";
import Link from "next/link";

import { obterConfigLoja } from "@/lib/db/config-loja";
import { capaDoProduto, listarVitrine, somarEstoque } from "@/lib/db/produtos";
import { formatarReais } from "@/lib/formato";
import { enderecoDaFoto } from "@/lib/supabase/armazenamento";

/**
 * A página fica guardada pronta e é servida sem consultar o banco.
 *
 * Antes ela perguntava ao banco a cada visita, e isso custava uns 400ms de tela
 * parada em TODA abertura — a cliente clica no link do WhatsApp e espera meio
 * segundo olhando o nada. Agora ela chega pronta, em torno de 25ms.
 *
 * O número abaixo é só a rede de segurança: no pior caso, a página se refaz
 * sozinha depois de um minuto. Na prática ela se refaz na hora, porque toda
 * ação do painel que muda o catálogo chama `revalidatePath("/")`.
 */
export const revalidate = 60;

/**
 * A vitrine.
 *
 * A foto é a protagonista: a compra é no celular e o produto é inteiramente
 * visual. Por isso as imagens ocupam a maior parte da tela e o texto fica
 * pequeno embaixo — nome e preço, nada mais. O resto é na página da peça.
 */
export default async function Home() {
  // Se o banco não responder, a loja mostra a versão sem os dados em vez de
  // dar erro na cara da cliente. Isso vale a regra do projeto: "a loja precisa
  // continuar funcionando se algo der errado" — ela sempre tem que conseguir
  // combinar por WhatsApp, como faz hoje.
  const [config, pecas] = await Promise.all([
    obterConfigLoja().catch(() => null),
    listarVitrine().catch(() => []),
  ]);

  return (
    <div className="animate-entrada">
      <header className="px-6 pt-14 text-center">
        <Image
          src="/logo.png"
          alt={config?.nomeLoja ?? "Paiva Swimwear"}
          width={1024}
          height={622}
          priority
          className="mx-auto h-auto w-44"
        />
        {config ? (
          <p className="mt-2 text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-suave)]">
            {config.cidade}
          </p>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
        {pecas.length === 0 ? (
          <p className="mx-auto max-w-xs text-center text-[var(--color-suave)]">
            O catálogo está sendo montado. Em breve você vê todas as peças por
            aqui, com os tamanhos disponíveis.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3">
            {pecas.map((peca) => {
              const capa = capaDoProduto(peca);
              const esgotada = somarEstoque(peca) === 0;

              return (
                <li key={peca.id}>
                  <Link href={`/${peca.slug}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--color-creme)]">
                      {capa ? (
                        <Image
                          src={enderecoDaFoto(capa)}
                          alt={peca.nome}
                          fill
                          sizes="(max-width: 640px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-active:scale-[1.03]"
                        />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center text-xs text-[var(--color-suave)]">
                          sem foto
                        </span>
                      )}

                      {esgotada ? (
                        <span className="absolute left-2 top-2 rounded-full bg-[var(--color-areia)]/90 px-2.5 py-1 text-[0.65rem] uppercase tracking-wider text-[var(--color-suave)]">
                          esgotado
                        </span>
                      ) : null}
                    </div>

                    <h2 className="mt-2.5 text-sm leading-snug">{peca.nome}</h2>
                    <p className="text-sm text-[var(--color-suave)]">
                      {formatarReais(peca.precoCentavos)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {config ? (
        <footer className="border-t border-[var(--color-linha)] px-6 py-10 text-center">
          <p className="text-xs text-[var(--color-suave)]">
            Entregas em {config.cidade}.
          </p>
        </footer>
      ) : null}
    </div>
  );
}
