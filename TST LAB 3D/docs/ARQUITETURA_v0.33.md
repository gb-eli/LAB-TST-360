# Arquitetura v0.33 — G10.3

```text
EnvironmentVisualTour
├── VisualTourProgressService
└── VisualTourRouteDirector
```

`VisualTourRouteDirector` é puro: recebe tour + progresso e calcula rota sem DOM.

Contrato:

```text
choiceById()
choiceForTarget()
decisionFor()
choicesFor()
suggestedPath()
nextStepId()
previousStepId()
routeEdges()
state()
```

O runtime continua carregando Panorama360Viewer/ObjectFocusViewer via import dinâmico.
