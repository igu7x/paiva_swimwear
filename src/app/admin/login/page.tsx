"use client";

import { useActionState } from "react";

import { entrar, type EstadoLogin } from "./acoes";

const estadoInicial: EstadoLogin = { erro: null };

export default function LoginPage() {
  const [estado, acao, enviando] = useActionState(entrar, estadoInicial);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-light tracking-tight">Painel da loja</h1>
      <p className="mt-2 text-sm text-[var(--color-suave)]">
        Entre para gerenciar as peças e os pedidos.
      </p>

      <form action={acao} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm">E-mail</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            className="rounded-xl border border-[var(--color-linha)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--color-tinta)]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm">Senha</span>
          <input
            type="password"
            name="senha"
            autoComplete="current-password"
            required
            className="rounded-xl border border-[var(--color-linha)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--color-tinta)]"
          />
        </label>

        {estado.erro ? (
          <p role="alert" className="text-sm text-red-700">
            {estado.erro}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={enviando}
          className="mt-2 rounded-full bg-[var(--color-tinta)] px-6 py-3.5 text-sm font-medium text-[var(--color-areia)] transition-colors duration-150 hover:bg-[var(--color-tinta-viva)] disabled:opacity-50"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
