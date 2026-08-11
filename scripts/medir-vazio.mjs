/**
 * Mede quanto de cada tela é fundo liso — sem foto, sem texto, sem nada.
 *
 * É a medida que separa o nosso site das referências. Vazio demais lê como
 * "inacabado", por mais bem executado que esteja o resto.
 *
 *     node scripts/medir-vazio.mjs
 *
 * Usa o próprio Chromium do Playwright para ler os PNGs: nenhuma biblioteca de
 * imagem a mais no projeto.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const navegador = await chromium.launch();
const pagina = await navegador.newPage();

const arquivos = fs
  .readdirSync("shots")
  .filter((f) => f.endsWith(".png"))
  .sort();

const linhas = [];

for (const arquivo of arquivos) {
  const dados = fs.readFileSync(path.join("shots", arquivo)).toString("base64");

  const medida = await pagina.evaluate(async (base64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${base64}`;
    await img.decode();

    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);

    // Acha a cor mais frequente: é o fundo.
    const contagem = new Map();
    for (let i = 0; i < data.length; i += 4) {
      // Agrupa em faixas de 8 para tolerar degradê e compressão.
      const chave =
        ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3);
      contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
    }
    let fundo = 0;
    let maior = 0;
    for (const [chave, n] of contagem) {
      if (n > maior) {
        maior = n;
        fundo = chave;
      }
    }
    const fr = ((fundo >> 10) & 31) << 3;
    const fg = ((fundo >> 5) & 31) << 3;
    const fb = (fundo & 31) << 3;

    // Conta quanto da tela é essa cor (com tolerância), ou seja: fundo liso.
    let lisos = 0;
    const total = c.width * c.height;
    for (let i = 0; i < data.length; i += 4) {
      const d =
        Math.abs(data[i] - fr) +
        Math.abs(data[i + 1] - fg) +
        Math.abs(data[i + 2] - fb);
      if (d < 34) lisos++;
    }

    return {
      vazio: Math.round((lisos / total) * 100),
      cor: `#${[fr, fg, fb].map((v) => v.toString(16).padStart(2, "0")).join("")}`,
    };
  }, dados);

  linhas.push({ arquivo, ...medida });
}

await navegador.close();

const largura = Math.max(...linhas.map((l) => l.arquivo.length));
let atual = "";
for (const l of linhas) {
  const grupo = l.arquivo.split("-tela")[0];
  if (grupo !== atual) {
    atual = grupo;
    console.log("");
  }
  const barra = "#".repeat(Math.round(l.vazio / 3));
  const alerta = l.vazio > 35 && l.arquivo.startsWith("mobile-nosso") ? "  <-- acima de 35%" : "";
  console.log(
    `${l.arquivo.padEnd(largura)}  ${String(l.vazio).padStart(3)}% ${l.cor}  ${barra}${alerta}`,
  );
}
