import { pagina } from "./ui";

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
    <main className={pagina} aria-busy>
      <div className="h-8 w-32 rounded-lg bg-[var(--color-linha)] animate-pulsar" />
      <div className="mt-2 h-4 w-44 rounded bg-[var(--color-linha)] animate-pulsar" />

      <div className="mt-8 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[4.5rem] rounded-2xl border border-[var(--color-linha)] bg-[var(--color-creme)]"
            // Os blocos pulsam levemente fora de compasso, um após o outro.
            // Pulsar tudo junto parece uma tela piscando; em cascata parece
            // carregamento.
            style={{ animation: `pulsar 1.4s ${i * 160}ms ease-in-out infinite` }}
          />
        ))}
      </div>

      <span className="sr-only">Carregando</span>
    </main>
  );
}
