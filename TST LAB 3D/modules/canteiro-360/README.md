# Canteiro de Obras 360 — v0.4.0

Laboratório híbrido de inspeção do TST 360.

## Renderizadores
- 2D/SVG com hotspots.
- 3D/Three.js com câmera orbital e raycasting.

Os seis riscos são os mesmos nos dois modos. O relatório guarda o modo utilizado, mas a avaliação pedagógica é única.

## G2
Cena procedimental com construção, andaime, trabalhador em altura, guindaste/carga suspensa, escada, cabos, materiais e trabalhador no solo.

## Evolução planejada
Trocar progressivamente primitivas por GLB/PBR e LOD, preservando IDs dos riscos e lógica da inspeção.


## G3 / v0.5.0
Assets GLB locais: escada, pallet e cone. O módulo preserva fallback leve.

## G4 / v0.6.0
- três trabalhadores articulados no cenário;
- posturas de caminhada, inspeção e subida;
- andaime, carrinho de mão e barreira adicionados ao pack GLB/LOD;
- manutenção dos mesmos seis riscos e do mesmo relatório no 2D e 3D.
