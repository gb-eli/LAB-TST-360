# TST 360 — Arquitetura v0.9 / G7

## Objetivo da G7
Fechar os oito laboratórios com visualização 3D opcional e introduzir uma camada forense reutilizável para investigação de ocorrências.

## Novos componentes
- `surface-library.js`: materiais procedurais leves para superfícies recorrentes;
- `three-scenes-g7.js`: cena forense tridimensional;
- captura PNG opcional no `ThreeViewport`;
- preset de iluminação `forensic`;
- pack GLB/LOD da Investigação de Acidentes.

## Investigação de Acidentes
A camada pedagógica mantém cinco evidências, hipótese, medida preventiva e relatório. O renderer pode ser 2D ou 3D.

A reconstrução possui três estados:
1. antes da ocorrência;
2. momento crítico;
3. pós-ocorrência.

Ela é uma ferramenta didática para organizar hipóteses e nunca deve ser apresentada como prova autônoma de causalidade.

## Cadeia de fallback
`GLB G7 → procedural Three.js → SVG 2D → mesma missão pedagógica`.

## Materiais
Os materiais G7 são gerados localmente em resoluções pequenas e adaptativas. O objetivo é melhorar leitura visual sem introduzir imediatamente texturas externas grandes.
