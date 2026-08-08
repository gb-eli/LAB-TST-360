# TST 360 — Arquitetura v0.29.0 / G9.9

## Evolução do lazy loading

### G9.8

```text
App
→ setor
→ sector.json
→ experiência
```

### G9.9

```text
App
→ setor
→ sector.json
→ panorama graph index
→ node selecionado
```

Um node não visitado não precisa ser solicitado.

## Estrutura

```text
data/environments/<sector>/
└── panorama/
    ├── index.json
    ├── node-a.json
    └── node-b.json
```

## PanoramaGraphLoader

```text
graph()
node(id)
stats()
```

Cache:

```text
graphPromise
nodePromises
```

## Viewer

O `Panorama360Viewer` mantém compatibilidade com o formato legado.

Se existir:

```text
experience.graph
```

usa o grafo.

Caso contrário, usa os hotspots embutidos da G9.8.

## Action routing

```text
Panorama360Viewer
↓ onAction
EnvironmentExperienceHub
↓ openExperience
├── ObjectFocusViewer
└── mission callback → SectorHub
```

O viewer não conhece RiskEngine ou scene factories.

## Profundidade

```text
panorama-atmosphere
panorama-track-base
panorama-track-near
hotspots
HUD
```

`setOffset()` aplica deslocamento levemente diferente ao foreground.

## Modularidade

Adicionar um terceiro ponto ao Porto exige apenas:

```text
novo node JSON
+
entrada em panorama/index.json
```

Não exige modificar Hospital, Oficina ou o núcleo.
