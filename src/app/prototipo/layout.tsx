import type { Metadata } from "next";
import localFont from "next/font/local";

/**
 * Protótipo de duas seções, isolado do resto do site.
 *
 * Fica numa rota própria de propósito: se estas duas seções ficarem certas, o
 * sistema delas passa a valer para a home inteira. Se ficarem erradas,
 * corrigimos duas seções em vez de dez.
 *
 * As fontes são servidas do nosso próprio endereço, não da CDN da Fontshare: a
 * página não fica esperando servidor de fora para desenhar o texto, e nada da
 * cliente é enviado para terceiros.
 */

const display = localFont({
  src: [
    { path: "../../fontes/zodiak-400.woff2", weight: "400", style: "normal" },
    { path: "../../fontes/zodiak-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--fonte-display",
  display: "swap",
});

const corpo = localFont({
  src: [
    { path: "../../fontes/satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../../fontes/satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../../fontes/satoshi-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--fonte-corpo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Protótipo — duas seções",
  robots: { index: false, follow: false },
};

export default function LayoutPrototipo({
  children,
}: LayoutProps<"/prototipo">) {
  return (
    <div className={`${display.variable} ${corpo.variable} prototipo`}>
      {children}
    </div>
  );
}
