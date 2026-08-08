# TST 360 — Arquitetura v0.7 / G5

## Objetivo

A fase G5 amplia o 3D sem transformar a plataforma em um projeto pesado. O foco é iluminação por ambiente, reaproveitamento do personagem articulado, expansão do pipeline GLB/LOD e entrada de modo 3D em Indústria e Espaço Confinado.

## Novos componentes

- `environment-manager.js`: perfis de luz e atmosfera para exterior, indústria, espaço confinado, escritório e neutro.
- `character-motion.js`: camada de estados de movimento desacoplada do rig atual, preparada para futuramente mapear estados genéricos para AnimationClips de um personagem GLB com skinning.
- `three-scenes-g5.js`: cenas 3D específicas para Indústria e Espaço Confinado.

## Regra de fallback

`GLB G5 → procedural 3D → SVG/2D`.

A falha do modo 3D nunca deve impedir a conclusão pedagógica do laboratório.

## Segurança didática

O módulo de Espaço Confinado permanece uma simulação de análise/decisão. Ele não representa autorização, treinamento ou procedimento suficiente para execução real de entrada.
