import type { Metadata } from "next";

import { BarraDaLoja } from "@/components/barra-da-loja";
import { obterConfigLoja } from "@/lib/db/config-loja";

import { Sacola } from "./sacola";

export const metadata: Metadata = {
  title: "Sacola — Paiva Swimwear",
  robots: { index: false },
};

/**
 * A sacola.
 *
 * A página em si é servida pronta: ela não sabe o que a cliente escolheu, e não
 * pode saber — isso mora no navegador dela. Quem busca os dados de cada item é
 * o componente de tela, chamando o servidor depois que a página abre.
 */
export const revalidate = 300;

export default async function CarrinhoPage() {
  const config = await obterConfigLoja().catch(() => null);

  return (
    <>
      <BarraDaLoja />

      <main className="mx-auto w-full max-w-md px-5 pb-20 pt-24">
        <h1 className="font-serif text-[2.1rem] leading-[1.1]">Sua sacola</h1>

        <div className="mt-7">
          <Sacola frete={config ? { cidade: config.cidade } : null} />
        </div>
      </main>
    </>
  );
}
