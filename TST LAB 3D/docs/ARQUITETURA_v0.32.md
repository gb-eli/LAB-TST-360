# TST 360 — Arquitetura v0.32.0 / G10.2

## Orquestração

```text
EnvironmentExperienceHub
↓ lazy import
EnvironmentVisualTour
├── VisualTourProgressService
├── Panorama360Viewer
├── ObjectFocusViewer
└── callback de missão → SectorHub
```

## O tour não é uma nova engine

Ele apenas coordena módulos já existentes.

## Dados

```text
data/tours/
├── index.json
├── construcao.json
├── industria.json
├── porto-logistica.json
├── saude.json
├── escritorio.json
├── almoxarifado.json
├── oficina.json
└── obras-eletricas.json
```

## Step contract

```json
{
  "id":"entrada",
  "type":"panorama",
  "experienceId":"panorama-360",
  "nodeId":"patio",
  "map":{"x":12,"y":58}
}
```

Tipos:
- panorama;
- object3d;
- mission3d.

## Progress

```text
StorageService
↓
visual-tour-progress:<tourId>
```

O Campus pode consultar progresso sem carregar o JSON do tour porque cada tour possui quatro etapas fixas nesta versão.

## Lazy graph

O tour passa `initialNodeId`.

```text
Panorama360Viewer
↓
graph()
↓
node(initialNodeId)
```

O node padrão não é carregado desnecessariamente.

## Missão

A missão não é montada dentro do runtime do tour.

```text
Tour
↓ launch
EnvironmentExperienceHub
↓ onMission
SectorHub
↓ createInspectionLab
```

Isso preserva RiskEngine, RiskBridge, evidências e relatórios.
