import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BarraDaLoja } from "@/components/barra-da-loja";
import { obterSessao } from "@/lib/autorizacao";

import { sair } from "../entrar/acoes";

export const metadata: Metadata = {
  title: "Minha conta — Paiva Swimwear",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * A área da cliente.
 *
 * Hoje ela é pequena de propósito: os pedidos ainda não existem no sistema, e
 * inventar caixas vazias com "em breve" espalhadas seria fingir função. Quando
 * o fechamento de pedido entrar, a lista de pedidos aparece aqui.
 *
 * Para a vendedora, esta tela é também a ponte para o painel — ela usa o mesmo
 * site que as clientes, no mesmo celular.
 */
export default async function ContaPage() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar?voltar=%2Fconta");

  const primeiroNome = sessao.nome?.split(" ")[0];

  return (
    <>
      <BarraDaLoja />

      <main className="mx-auto w-full max-w-md px-5 pb-24 pt-24">
        <h1 className="font-serif text-[2.1rem] leading-[1.1]">
          {primeiroNome ? `Oi, ${primeiroNome}` : "Minha conta"}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-suave)]">{sessao.email}</p>

        {sessao.vendedora ? (
          <Link
            href="/admin"
            className="mt-8 flex touch-manipulation items-center justify-between gap-4 rounded-2xl border border-[var(--color-dourado)] bg-[var(--color-creme)] p-5 transition-[transform,border-color] duration-200 hover:border-[var(--color-tinta)] active:scale-[0.99]"
          >
            <span>
              <span className="block font-medium">Painel da loja</span>
              <span className="mt-0.5 block text-sm text-[var(--color-suave)]">
                Peças, cores, fotos e estoque
              </span>
            </span>
            <span aria-hidden className="text-[var(--color-dourado)]">
              →
            </span>
          </Link>
        ) : null}

        <section className="mt-8 rounded-2xl border border-[var(--color-linha)] bg-[var(--color-creme)] p-5">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-suave)]">
            Meus pedidos
          </h2>
          <p className="mt-3 text-sm leading-relaxed">
            Assim que o fechamento de pedido pelo site estiver pronto, tudo que
            você comprar aparece aqui, com o status de cada entrega.
          </p>
        </section>

        <div className="mt-10 flex flex-col items-center gap-5 border-t border-[var(--color-linha)] pt-7">
          <Link
            href="/"
            className="touch-manipulation rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] px-6 py-3 text-[0.62rem] uppercase tracking-[0.2em] transition-[transform,border-color] duration-200 hover:border-[var(--color-tinta)] active:scale-[0.97]"
          >
            Ver as peças
          </Link>

          <form action={sair}>
            <button
              type="submit"
              className="touch-manipulation text-sm text-[var(--color-suave)] underline underline-offset-4 transition-colors hover:text-[var(--color-tinta)] active:opacity-60"
            >
              Sair desta conta
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
