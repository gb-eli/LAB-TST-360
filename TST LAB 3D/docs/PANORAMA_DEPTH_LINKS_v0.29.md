# Panorama Depth & Links — v0.29.0

## Camadas

### Cena base
SVG setorial principal.

### Foreground
Elementos visuais próximos com deslocamento ligeiramente maior.

### Atmosfera
Gradientes e luz ambiente leves.

### UI
Hotspots, bússola e pontos de observação.

## Parallax

```text
baseOffset = offset
nearOffset = offset × 1.045
```

com clamp no limite panorâmico.

É um efeito de profundidade visual leve.

Não é reconstrução tridimensional do panorama.

## Links internos

Hotspots especiais usam cores distintas:

- azul → objeto 3D;
- verde → missão;
- violeta → mudança de ponto.

Depois do toque, o painel inferior explica a ação antes de executá-la.

## Projetor

A `Tela de apresentação` continua disponível.

A barra de pontos fica visível e pode ser usada para mudar rapidamente a área explicada.

## Mobile

A barra de pontos é horizontal e rolável.

Labels dos hotspots podem ser reduzidos em telas pequenas, preservando o botão numerado/ícone.
