import { obterConfigLoja } from "@/lib/db/config-loja";
import { formatarReais } from "@/lib/formato";
import { obterUsuarioLogado } from "@/lib/supabase/servidor";

import { sair } from "./acoes";

/**
 * Painel da vendedora.
 *
 * Nesta etapa ele só confirma que o login funcionou e mostra a configuração
 * lida do banco. As telas de produtos, pedidos e entregas entram nas etapas
 * seguintes.
 */
export default async function PainelPage() {
  const [usuario, config] = await Promise.all([
    obterUsuarioLogado(),
    obterConfigLoja(),
  ]);

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Painel</h1>
          <p className="mt-1 text-sm text-[var(--color-suave)]">
            {usuario?.email}
          </p>
        </div>

        <form action={sair}>
          <button
            type="submit"
            className="rounded-full border border-[var(--color-linha)] px-4 py-2 text-sm"
          >
            Sair
          </button>
        </form>
      </div>

      <section className="mt-10 rounded-2xl border border-[var(--color-linha)] bg-white p-5">
        <h2 className="text-sm font-medium">Configurações da loja</h2>

        {config ? (
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-suave)]">Nome</dt>
              <dd>{config.nomeLoja}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-suave)]">Cidade</dt>
              <dd>{config.cidade}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-suave)]">WhatsApp</dt>
              <dd>{config.whatsapp}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-suave)]">Entrega</dt>
              <dd>{formatarReais(config.freteCentavos)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-suave)]">
            Nenhuma configuração encontrada. Rode <code>npm run db:migrate</code>.
          </p>
        )}

        <p className="mt-5 border-t border-[var(--color-linha)] pt-4 text-xs text-[var(--color-suave)]">
          Por enquanto esses valores só são alterados pelo banco. A tela para
          você editar entra junto com o catálogo.
        </p>
      </section>
    </main>
  );
}
