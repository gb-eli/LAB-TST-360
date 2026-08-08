# Performance da Atmosfera — v0.38.0

## Eco
- nenhum shell;
- nenhuma CanvasTexture atmosférica;
- nenhuma luz de acento.

## Medium
- 1 SphereGeometry;
- 1 CanvasTexture 64×128;
- 1 draw call adicional aproximado.

## High
- shell;
- 1 PointLight sem shadow.

## Ultra
- shell;
- 2 PointLights sem shadow;
- pulsação somente de intensidade.

## Ausente
Não foram adicionados:
- HDRI;
- cubemap;
- vídeo;
- WebP/JPEG/PNG de céu;
- pós-processamento;
- bloom;
- SSAO.

A arquitetura deixa esses itens para fases futuras somente se os testes de desempenho justificarem.
