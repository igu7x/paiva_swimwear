"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { criarConta, entrarNaConta, type EstadoConta } from "./acoes";

const CONTA_INICIAL: EstadoConta = { erro: null, aviso: null };

/**
 * Entrar e criar conta na MESMA tela, com um interruptor entre as duas.
 *
 * Duas páginas separadas obrigariam a cliente a saber, antes de digitar
 * qualquer coisa, se ela já tem conta aqui. Ela não sabe — chegou por um link
 * do WhatsApp e não faz ideia se já entrou nesta loja alguma vez.
 *
 * A conta é OPCIONAL na loja inteira: dá para ver as peças, montar a sacola e
 * (quando o fechamento de pedido existir) comprar sem criar nenhuma. Ela serve
 * para acompanhar os pedidos depois. Por isso a saída "ver as peças" fica
 * visível o tempo todo, e não escondida como se fosse desistência.
 */

const campo =
  "w-full rounded-xl border border-[var(--color-linha)] bg-[var(--color-creme)] px-4 py-3 text-base outline-none transition-colors focus:border-[var(--color-dourado)]";

export function FormularioDaConta({ voltar }: { voltar: string }) {
  const [criando, setCriando] = useState(false);

  const [estado, acao, enviando] = useActionState<EstadoConta, FormData>(
    criando ? criarConta : entrarNaConta,
    CONTA_INICIAL,
  );

  return (
    <div>
      {/* O interruptor. As duas opções ficam à vista: assim ela vê que existe
          o outro caminho antes de errar a senha três vezes. */}
      <div
        role="tablist"
        className="flex rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] p-1"
      >
        {[
          { rotulo: "Já tenho conta", valor: false },
          { rotulo: "Criar conta", valor: true },
        ].map(({ rotulo, valor }) => (
          <button
            key={rotulo}
            type="button"
            role="tab"
            aria-selected={criando === valor}
            onClick={() => setCriando(valor)}
            className={`flex-1 touch-manipulation rounded-full px-4 py-2.5 text-[0.66rem] uppercase tracking-[0.16em] transition-colors duration-200 ${
              criando === valor
                ? "bg-[var(--color-tinta)] text-white"
                : "text-[var(--color-suave)]"
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      <form action={acao} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="voltar" value={voltar} />

        {criando ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-suave)]">
              Seu nome
            </span>
            <input
              type="text"
              name="nome"
              autoComplete="name"
              required
              placeholder="Maria"
              className={campo}
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-suave)]">
            E-mail
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-suave)]">
            Senha
          </span>
          <input
            type="password"
            name="senha"
            // Diz ao gerenciador de senhas do celular se é para guardar uma
            // nova ou preencher a que já existe.
            autoComplete={criando ? "new-password" : "current-password"}
            required
            minLength={criando ? 6 : undefined}
            className={campo}
          />
          {criando ? (
            <span className="text-xs text-[var(--color-suave)]">
              Pelo menos 6 letras.
            </span>
          ) : null}
        </label>

        {estado.erro ? (
          <p role="alert" className="text-sm text-red-800">
            {estado.erro}
          </p>
        ) : null}

        {estado.aviso ? (
          <p
            role="status"
            className="rounded-2xl border border-[var(--color-dourado)] bg-[var(--color-creme)] p-4 text-sm"
          >
            {estado.aviso}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={enviando}
          className="mt-1 touch-manipulation rounded-full bg-[var(--color-tinta)] px-6 py-3.5 text-[0.66rem] uppercase tracking-[0.2em] text-white transition-transform duration-200 active:scale-[0.98] disabled:opacity-60"
        >
          {enviando ? "Um instante" : criando ? "Criar minha conta" : "Entrar"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--color-suave)]">
        Você não precisa de conta para comprar.{" "}
        <Link href="/" className="text-[var(--color-tinta)] underline underline-offset-4">
          Ver as peças
        </Link>
      </p>
    </div>
  );
}
