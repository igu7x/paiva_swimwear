/**
 * Os quatro símbolos que aparecem no rodapé da arte da loja, redesenhados em
 * traço fino para a tela.
 *
 * São SVG escrito à mão, e não imagem: acompanham a cor do texto em volta,
 * ficam nítidos em qualquer tela e pesam algumas centenas de bytes cada. Uma
 * imagem faria quatro downloads a mais antes da primeira foto aparecer.
 */

const traco = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Sol nascente com raios — o mesmo desenho da logo. */
export function Sol({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 22" className={className} aria-hidden {...traco}>
      <path d="M6 20a10 10 0 0 1 20 0" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const angulo = Math.PI * (0.08 + (i * 0.84) / 6);
        const x1 = 16 - Math.cos(angulo) * 13;
        const y1 = 20 - Math.sin(angulo) * 13;
        const x2 = 16 - Math.cos(angulo) * 17;
        const y2 = 20 - Math.sin(angulo) * 17;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </svg>
  );
}

/** Decote — a modelagem que valoriza o corpo. */
export function Decote({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traco}>
      <path d="M5 4c0 7 3 12 7 12s7-5 7-12" />
      <circle cx="12" cy="20" r="1.4" />
    </svg>
  );
}

/** Ondas — o tecido de secagem rápida. */
export function Ondas({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traco}>
      {[8, 13, 18].map((y) => (
        <path key={y} d={`M2 ${y}c3-2.4 5-2.4 8 0s5 2.4 8 0`} />
      ))}
    </svg>
  );
}

/** Brilho — conforto, leveza e liberdade. */
export function Brilho({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traco}>
      <path d="M12 3c0 5 1.6 7 6.5 7-4.9 0-6.5 2-6.5 7 0-5-1.6-7-6.5-7 4.9 0 6.5-2 6.5-7Z" />
      <path d="M19 15.5c0 2 .7 2.8 2.6 2.8-1.9 0-2.6.8-2.6 2.8 0-2-.7-2.8-2.6-2.8 1.9 0 2.6-.8 2.6-2.8Z" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   OS ÍCONES DE NAVEGAÇÃO

   Mesmo traço fino dos símbolos da marca, de propósito: são os dois únicos
   botões que ficam fixos por cima da loja inteira, e um ícone de biblioteca
   pronta ao lado da arte dela denunciaria na hora que veio de outro lugar.
   ------------------------------------------------------------------------- */

/** Conta da cliente. */
export function Pessoa({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traco}>
      <circle cx="12" cy="8.4" r="3.9" />
      <path d="M4.6 20.2c.7-3.9 3.8-6.1 7.4-6.1s6.7 2.2 7.4 6.1" />
    </svg>
  );
}

/** Sacola de compras. */
export function Sacola({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traco}>
      <path d="M5.1 8.4h13.8l-1 11.2a1.8 1.8 0 0 1-1.8 1.6H7.9a1.8 1.8 0 0 1-1.8-1.6Z" />
      <path d="M8.9 10.4V6.9a3.1 3.1 0 0 1 6.2 0v3.5" />
    </svg>
  );
}

/** Os quatro atributos, do jeito que aparecem na arte da marca. */
export const ATRIBUTOS = [
  { Icone: Sol, texto: "Feitos para tomar sol" },
  { Icone: Decote, texto: "Modelagem que valoriza o corpo" },
  { Icone: Ondas, texto: "Tecido premium de secagem rápida" },
  { Icone: Brilho, texto: "Conforto, leveza e liberdade" },
] as const;
