# Panorama 360 — v0.28.0

## Renderer atual

```text
procedural-svg-360
```

O SVG tem largura virtual de 2400 unidades e representa quatro orientações:

```text
Norte
Leste
Sul
Oeste
```

O viewport exibe aproximadamente um quarto por vez.

## Controle

Mouse/touch:

```text
pointerdown
pointermove
pointerup
```

Teclado:

```text
←
→
```

Botões:

- esquerda;
- centralizar;
- direita.

## Ângulo

O deslocamento horizontal é convertido em:

```text
0° → 360°
```

## Hotspots

Cada setor possui 5 pontos.

Um hotspot contém:

```json
{
  "x":50,
  "y":40,
  "label":"...",
  "note":"..."
}
```

As coordenadas são percentuais no panorama.

## Performance

O viewer não importa Three.js.

Isso o torna uma opção útil quando:

- WebGL não está disponível;
- dispositivo está em Eco;
- professor quer apenas apresentação rápida;
- aluno quer revisar visualmente.

## Próxima geração

O contrato foi preparado para:

```text
equirectangular-image
cubemap
```

A futura troca deve acontecer no renderer, não no SectorHub.
