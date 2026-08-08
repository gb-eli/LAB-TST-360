# Arquitetura TST 360 v0.3

## Runtime
`ModuleRegistry → ModuleManager → createModule(context)`.

## Motores reutilizáveis
- `inspection-lab.js`: inspeção por hotspots.
- `procedure-lab.js`: decisão sequencial.
- módulos customizados: EPI, Ergonomia e Investigação.

## Gráfico G1.5
SVG/CSS com `scene-depth.js`. O efeito de profundidade é desligado em Eco e quando o usuário prefere reduzir movimento.

## Caminho para G2
A próxima camada pode introduzir `ThreeSceneAdapter` sem remover o SVG atual. Cada módulo poderá declarar `renderer: three|svg` e o Quality Manager decidir o melhor caminho/fallback.
