# Panorama Image Pipeline — v0.30.0

## Estrutura

```text
assets/panoramas/g10/
├── manifest.json
├── construcao/
├── industria/
├── porto-logistica/
├── saude/
├── escritorio/
├── almoxarifado/
├── oficina/
└── obras-eletricas/
```

Cada node contém:

```text
<node>_medium.webp
<node>_high.webp
<node>_ultra.webp
```

## Resolução

| Tier | Resolução |
|---|---|
| Medium | 1024×512 |
| High | 1600×800 |
| Ultra | 2400×1200 |

## Formato

```text
WebP
```

## Manifest

`manifest.json` registra:
- path;
- largura;
- altura;
- bytes;
- SHA-256.

## Hotspot Transform

Os panoramas de referência foram construídos a partir da arte procedural horizontal.

Por isso cada node declara:

```json
{
  "hotspotTransform":{
    "top":0.283333,
    "height":0.433333
  }
}
```

Isso remapeia a posição vertical antiga para o quadro equiretangular 2:1.

Uma fotografia real futura pode usar coordenadas próprias e remover/alterar esse transform.

## Orçamento

O arquivo atual deve permanecer abaixo do orçamento definido em:

```text
data/performance/panorama-budgets.json
```

## Importante

Os arquivos da v0.30 são referências gráficas.

A expressão “panorama equiretangular” descreve a projeção técnica do arquivo, não significa que a imagem seja uma fotografia real.
