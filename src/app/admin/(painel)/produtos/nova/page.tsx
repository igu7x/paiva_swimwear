import Link from "next/link";

import { FormularioProduto } from "../formulario-produto";

/**
 * Cadastro de peça nova.
 *
 * Só os dados da peça. As cores e o estoque entram na tela seguinte, depois de
 * salvar — dois formulários curtos funcionam melhor no celular do que um
 * formulário comprido que ela precisa rolar inteiro antes de conseguir salvar.
 */
export default function NovaPecaPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-2xl">Nova peça</h1>
        <Link
          href="/admin/produtos"
          className="text-sm text-[var(--color-suave)]"
        >
          Cancelar
        </Link>
      </div>

      <p className="mt-2 mb-8 text-sm text-[var(--color-suave)]">
        Depois de salvar você cadastra as cores e quanto tem de cada tamanho.
      </p>

      <FormularioProduto />
    </main>
  );
}
