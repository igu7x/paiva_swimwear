# Créditos de imagens

## `public/praia.webp` — fundo da vitrine

**Foto da própria loja.** Original em `assets/originais/fotopraia.jpg`.

| | |
| --- | --- |
| Original | 5353×3000 JPEG, 15,3 MB |
| No site | 2400×1345 WebP, 544 KB |

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
  .resize({ width: 2400 })
  .webp({ quality: 72 })
```

544 KB é, de longe, o maior arquivo do site. A resolução alta foi pedida: em tela grande, versões menores apareciam borradas. O custo é real no 4G, e vale rever se algum dia a loja reclamar de lentidão no celular.

## `public/logo.png`

Logo da marca, fornecida pela loja.
