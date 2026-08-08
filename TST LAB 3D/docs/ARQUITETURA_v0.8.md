
# TST 360 — Arquitetura v0.8 / G6

## Objetivo da G6

Expandir o renderer 3D para Eletricidade e Incêndio/Evacuação e criar efeitos visuais dinâmicos governados pelo perfil gráfico.

## Novos componentes

- `effects-manager.js`: partículas de fumaça, brilho/faísca didática, beacon e pulsos de rota.
- `three-scenes-g6.js`: cenas 3D de Eletricidade e Incêndio/Evacuação.
- novos presets de ambiente `electrical` e `emergency`.

## Regra de segurança pedagógica

Os efeitos não são modelos de engenharia. Fumaça, partículas, brilho e tempos visuais são ilustrativos e não devem ser usados para inferir concentração, energia, distância segura, tempo de abandono ou desempenho real de sistemas.

## Desempenho

A quantidade de partículas é multiplicada por `qualityManager.settings.particles`:
- Eco: quase sem partículas;
- Médio: densidade moderada;
- Alto: densidade de referência;
- Ultra: densidade ampliada.

## Cobertura 3D

Na v0.8, 7 dos 8 laboratórios possuem modo 3D sob demanda. Investigação de Acidentes permanece como laboratório 2D especializado para a próxima expansão.
