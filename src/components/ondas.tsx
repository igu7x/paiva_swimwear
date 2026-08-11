/**
 * As ondas que fluem conforme a pessoa rola.
 *
 * COMO O MOVIMENTO ACONTECE
 *
 * A rolagem escreve uma variável no documento (`--rolagem`, em pixels
 * percorridos) e o CSS lê essa variável para deslocar cada faixa. Não existe
 * animação de relógio aqui: parou o dedo, parou a onda. Voltou, a onda volta.
 *
 * São três faixas com velocidades diferentes. É isso que dá profundidade — a
 * de trás anda devagar, a da frente anda rápido, e o olho lê as duas como
 * distâncias diferentes. Uma faixa só pareceria um adesivo escorregando.
 *
 * O desenho é repetido lado a lado e a faixa tem o dobro da largura. Quando
 * ela se desloca uma largura inteira, a cópia seguinte está exatamente onde a
 * primeira estava, e o movimento não tem emenda.
 */

type Props = {
  /** Onde a faixa fica: no alto da seção ou no pé dela. */
  posicao: "topo" | "base";
  className?: string;
};

/** Um perfil de onda. Repetido, ele vira uma faixa contínua. */
function Perfil({ id, d }: { id: string; d: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className="h-full w-1/2 shrink-0"
      key={id}
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}

const PERFIS = {
  fundo: "M0,64 C240,24 480,104 720,64 C960,24 1200,104 1440,64 L1440,120 L0,120 Z",
  meio: "M0,72 C180,110 360,30 540,72 C720,114 900,34 1080,72 C1260,110 1380,52 1440,66 L1440,120 L0,120 Z",
  frente:
    "M0,86 C160,58 320,110 480,86 C640,62 800,110 960,86 C1120,62 1280,110 1440,86 L1440,120 L0,120 Z",
};

export function Ondas({ posicao, className = "" }: Props) {
  const viradas = posicao === "topo" ? "rotate-180" : "";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 h-16 overflow-hidden sm:h-24 ${
        posicao === "topo" ? "top-0" : "bottom-0"
      } ${viradas} ${className}`}
    >
      {/* Cada faixa tem largura dobrada e dois desenhos iguais lado a lado. */}
      <div className="onda onda-fundo absolute inset-0 flex w-[200%] text-[var(--color-areia)]/45">
        <Perfil id="f1" d={PERFIS.fundo} />
        <Perfil id="f2" d={PERFIS.fundo} />
      </div>
      <div className="onda onda-meio absolute inset-0 flex w-[200%] text-[var(--color-areia)]/65">
        <Perfil id="m1" d={PERFIS.meio} />
        <Perfil id="m2" d={PERFIS.meio} />
      </div>
      <div className="onda onda-frente absolute inset-0 flex w-[200%] text-[var(--color-areia)]">
        <Perfil id="d1" d={PERFIS.frente} />
        <Perfil id="d2" d={PERFIS.frente} />
      </div>
    </div>
  );
}
