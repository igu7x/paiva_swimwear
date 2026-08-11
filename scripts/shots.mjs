/**
 * Fotografa o nosso site e as referências, para eu OLHAR em vez de supor.
 *
 * Seis tentativas de design falharam porque eu nunca vi o que construí nem o
 * que estamos tentando imitar. Este arquivo é o conserto: rode, olhe as
 * imagens, meça, corrija.
 *
 *     node scripts/shots.mjs            (o site precisa estar no ar)
 *
 * As imagens saem em ./shots (fora do Git).
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3000";

const ALVOS = [
  { nome: "nosso-prototipo", url: `${BASE}/prototipo` },
  { nome: "nosso-site", url: BASE },
  { nome: "ref-abtc", url: "https://www.abtc.com/" },
  { nome: "ref-icomat", url: "https://www.icomat.co.uk/" },
  { nome: "ref-overlake", url: "https://www.overlake.org/" },
];

// Celular primeiro — é como a cliente chega.
const TELAS = [
  { nome: "mobile", width: 390, height: 844 },
  { nome: "desktop", width: 1440, height: 900 },
];

fs.mkdirSync("shots", { recursive: true });
const navegador = await chromium.launch();

for (const tela of TELAS) {
  const contexto = await navegador.newContext({
    viewport: { width: tela.width, height: tela.height },
    deviceScaleFactor: 1,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  });

  for (const alvo of ALVOS) {
    const pagina = await contexto.newPage();
    try {
      await pagina.goto(alvo.url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await pagina.waitForTimeout(3500);

      // Seis telas rolando, para ver o RITMO e as transições.
      for (let i = 0; i < 6; i++) {
        await pagina.evaluate(
          (n) =>
            window.scrollTo({
              top: n * window.innerHeight * 0.9,
              behavior: "instant",
            }),
          i,
        );
        await pagina.waitForTimeout(1400);
        await pagina.screenshot({
          path: `shots/${tela.nome}-${alvo.nome}-tela${i}.png`,
        });
      }
      console.log(`ok  ${tela.nome} ${alvo.nome}`);
    } catch (e) {
      console.error(`falhou  ${tela.nome} ${alvo.nome}: ${e.message}`);
    }
    await pagina.close();
  }

  await contexto.close();
}

await navegador.close();
console.log("pronto -> ./shots");
