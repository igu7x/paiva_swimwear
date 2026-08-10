/**
 * O que aparece enquanto uma tela do painel busca os dados.
 *
 * Sem este arquivo, o navegador fica na tela anterior sem dar sinal de vida até
 * o servidor responder — e é isso que dá a sensação de travado. Com ele, o
 * clique tem resposta na hora, mesmo que o conteúdo demore mais um instante.
 *
 * O desenho imita o formato das telas de verdade (título, blocos), então a
 * troca não "pula" quando o conteúdo chega.
 */
export default function CarregandoPainel() {
  return (
    <main className="mx-auto max-w-md animate-pulse px-6 py-12">
      <div className="h-8 w-32 rounded-lg bg-[var(--color-linha)]" />

      <div className="mt-10 flex flex-col gap-3">
        <div className="h-24 rounded-2xl bg-[var(--color-linha)]" />
        <div className="h-24 rounded-2xl bg-[var(--color-linha)]" />
        <div className="h-24 rounded-2xl bg-[var(--color-linha)]" />
      </div>

      <span className="sr-only">Carregando</span>
    </main>
  );
}
