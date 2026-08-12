import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { obterSessao } from "@/lib/autorizacao";

import { FormularioDaConta } from "./formulario";

export const metadata: Metadata = {
  title: "Entrar — Paiva Swimwear",
  robots: { index: false },
};

// Precisa saber quem está logado agora, então não pode ser gerada uma vez e
// reaproveitada como a vitrine.
export const dynamic = "force-dynamic";

export default async function EntrarPage({
  searchParams,
}: PageProps<"/entrar">) {
  const { voltar } = await searchParams;
  const destino = typeof voltar === "string" ? voltar : "/conta";

  // Quem já está logado não tem o que fazer nesta tela.
  if (await obterSessao()) redirect(destino.startsWith("/") ? destino : "/conta");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6 py-16">
      <Link href="/" aria-label="Início" className="mx-auto">
        <Image
          src="/logo.png"
          alt="Paiva Swimwear"
          width={1024}
          height={622}
          priority
          className="h-16 w-auto"
        />
      </Link>

      <h1 className="mt-10 text-center font-serif text-[2rem] leading-[1.1]">
        Sua conta
      </h1>
      <p className="mx-auto mt-2 max-w-[15rem] text-center text-sm text-[var(--color-suave)]">
        Para acompanhar seus pedidos e não digitar o endereço de novo.
      </p>

      <div className="mt-9">
        <FormularioDaConta voltar={destino} />
      </div>
    </main>
  );
}
