"use server";

import { revalidatePath } from "next/cache";

import { apagarFoto, obterProduto, registrarFoto } from "@/lib/db/produtos";
import {
  BALDE,
  caminhoDaFoto,
  TAMANHO_MAXIMO,
  TIPOS_ACEITOS,
} from "@/lib/supabase/armazenamento";
import { criarClienteSupabase, obterUsuarioLogado } from "@/lib/supabase/servidor";

export type EstadoFotos = { erro: string | null; enviadas: number };

/**
 * Envia fotos para o Storage e registra cada uma no banco.
 *
 * A autorização é da vendedora: o cliente do Supabase criado aqui carrega a
 * sessão dela, e é o Supabase que confere se ela pode gravar naquele balde. O
 * nosso código não decide isso — se o login vencer, o envio é recusado lá.
 *
 * As checagens de tipo e tamanho existem em três lugares: no campo da tela (só
 * conveniência), aqui, e no próprio balde. Só a última é impossível de burlar,
 * mas errar cedo dá mensagem melhor do que errar tarde.
 */
export async function enviarFotos(
  _anterior: EstadoFotos,
  formData: FormData,
): Promise<EstadoFotos> {
  const produtoId = Number(formData.get("produtoId"));
  const variacaoBruta = String(formData.get("variacaoId") ?? "");
  const variacaoId = variacaoBruta ? Number(variacaoBruta) : null;

  if (!produtoId) return { erro: "Peça não encontrada.", enviadas: 0 };

  if (!(await obterUsuarioLogado())) {
    return { erro: "Seu login expirou. Entre de novo.", enviadas: 0 };
  }

  const produto = await obterProduto(produtoId);
  if (!produto) return { erro: "Peça não encontrada.", enviadas: 0 };

  // A cor recém-acrescentada aparece na tela com um id provisório antes de o
  // servidor responder. Mandar foto nesse instante quebraria no banco — aqui
  // a resposta é uma frase que ela entende.
  if (variacaoId !== null && !produto.variacoes.some((v) => v.id === variacaoId)) {
    return {
      erro: "Espere a cor terminar de salvar e tente de novo.",
      enviadas: 0,
    };
  }

  const arquivos = formData
    .getAll("fotos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (arquivos.length === 0) {
    return { erro: "Escolha pelo menos uma foto.", enviadas: 0 };
  }

  const supabase = await criarClienteSupabase();
  let enviadas = 0;

  for (const arquivo of arquivos) {
    const extensao = TIPOS_ACEITOS[arquivo.type];

    if (!extensao) {
      return {
        erro: `"${arquivo.name}" não é uma imagem. Aceito JPG, PNG, WebP e AVIF.`,
        enviadas,
      };
    }

    if (arquivo.size > TAMANHO_MAXIMO) {
      const mb = (arquivo.size / 1024 / 1024).toFixed(1);
      return {
        erro: `"${arquivo.name}" tem ${mb}MB. O limite é 8MB.`,
        enviadas,
      };
    }

    const caminho = caminhoDaFoto(produto.slug, variacaoId, extensao);

    const { error } = await supabase.storage
      .from(BALDE)
      .upload(caminho, arquivo, { contentType: arquivo.type });

    if (error) {
      console.error("Falha ao enviar foto:", error);
      return {
        erro:
          enviadas > 0
            ? `Enviei ${enviadas}, mas "${arquivo.name}" falhou. Tente de novo.`
            : `Não consegui enviar "${arquivo.name}". Tente de novo.`,
        enviadas,
      };
    }

    // Só registra no banco depois que o arquivo existe. Se registrasse antes e
    // o envio falhasse, a tela mostraria uma foto quebrada para sempre.
    await registrarFoto(produtoId, variacaoId, caminho);
    enviadas++;
  }

  revalidatePath(`/admin/produtos/${produtoId}`);
  revalidatePath("/");

  return { erro: null, enviadas };
}

/** Remove a foto do banco e o arquivo do Storage. */
export async function removerFoto(formData: FormData) {
  const produtoId = Number(formData.get("produtoId"));
  const fotoId = Number(formData.get("fotoId"));

  if (!produtoId || !fotoId) return;
  if (!(await obterUsuarioLogado())) return;

  const caminho = await apagarFoto(produtoId, fotoId);
  if (!caminho) return;

  const supabase = await criarClienteSupabase();
  const { error } = await supabase.storage.from(BALDE).remove([caminho]);

  // O registro já saiu do banco, então a foto sumiu da tela de qualquer jeito.
  // Um arquivo órfão no Storage é desperdício de espaço, não defeito visível —
  // por isso isto só é anotado, e não devolvido como erro para ela.
  if (error) console.error("Arquivo não removido do Storage:", caminho, error);

  revalidatePath(`/admin/produtos/${produtoId}`);
  revalidatePath("/");
}
