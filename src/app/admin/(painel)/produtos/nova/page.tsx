import Link from "next/link";

import { FormularioProduto } from "../formulario-produto";
import { legenda, pagina, titulo } from "../../ui";

/**
 * Cadastro de peça nova.
 *
 * Só os dados da peça. As cores e o estoque entram na tela seguinte, depois de
 * salvar — dois formulários curtos funcionam melhor no celular do que um
 * formulário comprido que ela precisa rolar inteiro antes de conseguir salvar.
 */
export default function NovaPecaPage() {
  return (
    <main className={pagina}>
      <Link
        href="/admin/produtos"
        className="text-sm text-[var(--color-suave)]"
      >
        ← Peças
      </Link>

      <h1 className={`${titulo} mt-3`}>Nova peça</h1>
      <p className={`${legenda} mt-1`}>
        Depois de salvar você cadastra as cores e as quantidades.
      </p>

      <div className="mt-8">
        <FormularioProduto />
      </div>
    </main>
  );
}
