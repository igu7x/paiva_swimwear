# Créditos de imagens

## `public/praia.webp` — fundo da vitrine

**Foto da própria loja.** Original em `assets/originais/fotopraia.jpg`.

| | |
| --- | --- |
| Original | 8064×5376 JPEG, 28 MB |
| No site | 1600×1067 WebP, 246 KB |

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
sharp('assets/originais/fotopraia.jpg')
  .resize({ width: 1600 })
  .webp({ quality: 70 })
```

246 KB é o maior arquivo do site. Foi escolhido depois de comparar seis
combinações de tamanho e compressão: abaixo disso a areia começa a manchar, e
acima o ganho não se vê, porque a foto fica atrás de uma camada de luz.

## `public/logo.png`

Logo da marca, fornecida pela loja.
