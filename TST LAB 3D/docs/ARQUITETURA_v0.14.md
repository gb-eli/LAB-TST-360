# TST 360 — Arquitetura v0.14.0 / G8.4

## Objetivos

1. Fazer a biblioteca setorial variar sem duplicar missões.
2. Criar o primeiro setor profissional completo com 3D sob demanda.
3. Reutilizar AssetManager, LOD, Instancing, Performance Budgets e InspectionSessionService.

## Variantes setoriais

Cada uma das 16 missões possui três variantes:

```text
Missão
├── Variante A
├── Variante B
└── Variante C
```

A variante pode definir:

- riscos ativos;
- instrução;
- descrição operacional;
- offsets 2D;
- offsets 3D;
- composição específica do renderer.

Total inicial:

```text
16 missões × 3 variantes = 48 configurações
```

## Setor Porto 3D

Arquivo:

```text
js/graphics/three-scenes-sector-port.js
```

Factory pública:

```js
createPortSector3D(host, context, state)
```

O `state` contém:

```js
{
  missionId,
  found,
  activeRiskIds,
  variant,
  onRisk
}
```

Assim a cena respeita exatamente a mesma configuração pedagógica do modo 2D.

## Pack de assets

```text
assets/sectors/porto/g1/
├── manifest.json
├── container_lod0.glb
├── container_lod1.glb
├── truck_lod0.glb
├── truck_lod1.glb
├── reachstacker_lod0.glb
├── reachstacker_lod1.glb
├── dock_bumper_lod0.glb
└── dock_bumper_lod1.glb
```

O AssetManager escolhe LOD conforme Eco/Médio/Alto/Ultra.

## Instancing

Contêineres de fundo e marcações repetidas utilizam `InstancedMesh`.

Isso permite representar escala portuária sem criar um draw call independente para cada objeto repetido.

## Pátio

Elementos principais:

- piso operacional;
- água/faixa portuária;
- pilhas de contêineres;
- guindaste procedural;
- carga suspensa;
- caminhão;
- reach stacker didático;
- trabalhador;
- TST;
- cruzamento/rotas;
- hotspots de risco.

## Doca

Elementos principais:

- edificação;
- plataforma elevada;
- borda;
- caminhão;
- pallet/carga;
- trabalhador em movimentação manual;
- guia/TST;
- bumpers;
- faixas e cruzamentos;
- hotspots.

## Performance

O SectorHub emite um contexto equivalente a `module:opened` durante missões setoriais 3D.

O Performance Budget Manager passa a avaliar as duas cenas portuárias com budgets próprios.

## Fallback

```text
Porto GLB/LOD
↓ falha do asset
objetos procedurais 3D
↓ WebGL indisponível
SVG setorial
↓
mesma missão, RiskEngine, evidências e relatório
```

## Regra pedagógica

O 3D aumenta contexto e capacidade de observação. Ele não define distâncias normativas, capacidades de equipamentos, procedimentos operacionais ou critérios oficiais.
