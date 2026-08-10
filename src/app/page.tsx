import Image from "next/image";

import { obterConfigLoja } from "@/lib/db/config-loja";
import { linkWhatsApp } from "@/lib/formato";

/**
 * A página fica guardada pronta e é servida sem consultar o banco.
 *
 * Antes ela perguntava ao banco a cada visita, e isso custava uns 400ms de tela
 * parada em TODA abertura — a cliente clica no link do WhatsApp e espera meio
 * segundo olhando o nada. Agora ela chega pronta, em torno de 30ms.
 *
 * O número abaixo é só a rede de segurança: no pior caso, a página se refaz
 * sozinha depois de um minuto. Na prática ela se refaz na hora, porque toda
 * ação do painel que muda o catálogo chama `revalidatePath("/")` — ver
 * src/app/admin/(painel)/produtos/acoes.ts. Ou seja: ela salva o estoque e a
 * loja já mostra o novo.
 */
export const revalidate = 60;

/**
 * Vitrine da loja.
 *
 * Nesta etapa ela existe só para provar que o caminho inteiro funciona: o
 * navegador chama o servidor, o servidor lê o banco no Supabase, e o que
 * aparece na tela veio de lá. O catálogo entra na Etapa 2, e o visual de
 * verdade também.
 */
export default async function Home() {
  // Se o banco não responder, a loja mostra a versão sem os dados em vez de
  // dar erro na cara da cliente. Isso vale a regra do projeto: "a loja precisa
  // continuar funcionando se algo der errado" — ela sempre tem que conseguir
  // combinar por WhatsApp, como faz hoje.
  //
  // Vale também para o momento de publicar: esta página é montada durante o
  // build, e sem isto um banco fora do ar derrubaria o deploy inteiro.
  const config = await obterConfigLoja().catch((erro) => {
    console.error("Vitrine: banco indisponível.", erro);
    return null;
  });

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-16 text-center">
      {/*
        A logo é a marca inteira, então ela É o título da página — por isso está
        dentro do h1, com o nome da loja no `alt`. Quem enxerga vê o desenho;
        um leitor de tela e o Google leem "Paiva Swimwear".

        `priority` manda carregar esta imagem antes das outras: ela é a primeira
        coisa que a cliente vê, e o site abre no celular com internet ruim.
      */}
      <h1>
        <Image
          src="/logo.png"
          alt={config?.nomeLoja ?? "Paiva Swimwear"}
          width={1024}
          height={622}
          priority
          className="mx-auto h-auto w-56"
        />
      </h1>

      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[var(--color-suave)]">
        {config ? config.cidade : ""}
      </p>

      <p className="mt-8 text-[var(--color-suave)]">
        O catálogo está sendo montado. Em breve você vai ver todas as peças por
        aqui, com os tamanhos disponíveis.
      </p>

      {config ? (
        <a
          href={linkWhatsApp(
            config.whatsapp,
            "Oi! Vi o site e queria saber mais sobre as peças.",
          )}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--color-tinta)] px-6 py-3.5 text-sm font-medium text-white"
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
