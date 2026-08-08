# TST 360 — Arquitetura v0.10.0 / G8

## Objetivo da G8

A G8 muda o foco de crescimento: além de manter os 8 laboratórios híbridos 2D/3D, passa a medir e reduzir custo gráfico e conecta as simulações a ferramentas didáticas de organização do trabalho do TST.

## Novos componentes

### `SceneMetrics`

Cada `ThreeViewport` mede periodicamente:

- FPS efetivo do renderer;
- meta de FPS do perfil gráfico;
- draw calls;
- triângulos;
- geometrias;
- texturas;
- `InstancedMesh` e número de instâncias;
- assets GLB em cache e referências ativas.

Os dados são emitidos pelo `EventBus` em `scene:metrics`. A interface mostra um resumo e mantém os detalhes no tooltip do indicador.

### `InstancingManager`

Gerencia objetos procedurais repetidos usando `THREE.InstancedMesh`. A primeira aplicação está no Canteiro, onde uma sequência de postes de segurança é enviada em um único drawable em vez de vários meshes equivalentes.

Objetivo: expandir progressivamente para cones, caixas, luminárias, pallets, demarcações e outros elementos repetitivos.

### Central de Ferramentas TST

Arquivo principal: `js/tools/tst-toolkit.js`.

Ferramentas:

1. painel de resultados dos 8 laboratórios;
2. matriz de risco didática;
3. APR didática;
4. checklist de inspeção;
5. inventário de riscos;
6. PGR / plano de ação didático;
7. exportação de portfólio JSON.

Os dados ficam no `localStorage` dentro do namespace do TST 360. Não existe backend obrigatório.

## Separação conceitual

```text
Laboratórios
  observação / decisão / simulação
            ↓
     resultados locais
            ↓
Central de Ferramentas TST
  organização / análise / registros didáticos
```

A Central não é tratada como laboratório e não altera o registro dos oito módulos.

## Segurança pedagógica

As escalas e modelos da Central são explicitamente didáticos. Eles não substituem:

- avaliações profissionais;
- procedimentos internos;
- documentos legais;
- programas oficiais;
- capacitação prática;
- medições reais.

## Próximas otimizações previstas

- instancing de mais objetos repetidos;
- budgets por laboratório;
- relatório comparativo de draw calls/triângulos por perfil;
- pré-carregamento orientado por navegação;
- compressão Meshopt/Draco onde houver ganho mensurável;
- KTX2 para texturas reais futuras;
- descarte e telemetria local de memória por sessão.
