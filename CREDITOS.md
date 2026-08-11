# Créditos de imagens

## `public/praia.webp` — fundo da vitrine

**Foto da própria loja.** Original em `assets/originais/fotopraia.png`.

| | |
| --- | --- |
| Original | 1672×941 PNG, 2,3 MB |
| No site | 1672×941 WebP, 204 KB |

Sendo foto da loja, não há licença de terceiro envolvida e não existe crédito a
prestar. É o cenário certo: nenhum banco de imagem mostra o produto no contexto
real dela.

O original fica **fora de `public/`** de propósito. Tudo que está em `public/`
é servido pela internet, e não faz sentido a cliente poder baixar 2,5 MB de uma
foto que a página nunca usa nesse tamanho.

### Como trocar

Coloque a nova foto em `assets/originais/`, gere a versão do site e substitua
`public/praia.webp`. O comando que gerou a atual:

```
sharp('assets/originais/fotopraia.png')
  .webp({ quality: 82 })
```

204 KB. A imagem entra no tamanho original, sem redimensionar: ela ja chega em 1672px, que basta para um fundo, e como aparece desfocada no site nao precisa de mais. A qualidade 82 e alta de proposito — o desfoque e efeito do navegador, entao o arquivo precisa continuar nitido.

## `public/logo.png`

Logo da marca, fornecida pela loja.
