# EPI Lab 3D — v0.4.0

Laboratório híbrido do TST 360.

## Renderizadores
- 2D/SVG: sempre disponível e leve.
- 3D/Three.js: carregado sob demanda.

## G2
O manequim 3D é procedimental e permite visualizar os oito grupos de EPI usados na atividade. Alterar seleção atualiza a cena 3D sem recriar o renderer.

## Evolução planejada
Na fase G3, o manequim procedimental poderá ser substituído por GLB com maior fidelidade sem alterar cenários, respostas, pontuação ou relatórios.


## G3 / v0.5.0
Assets GLB locais: capacete, óculos, respirador e cinturão. O módulo preserva fallback leve.

## G4 / v0.6.0
- personagem TST articulado compartilhado;
- 8 grupos de EPI no pipeline GLB;
- novos GLBs de protetor auditivo, luvas, botas e protetor facial;
- posturas reutilizáveis preparadas para outros laboratórios;
- fallback G4 → G3 → procedural → 2D.
