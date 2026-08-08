# Tour Lazy Loading — v0.32.0

## Biblioteca

O card do tour usa apenas metadados presentes no `sector.json`.

O arquivo:

```text
data/tours/<sector>.json
```

é solicitado somente no clique.

## Etapa 1 / 3 — panorama

Carrega:
- viewer;
- graph;
- node selecionado;
- tier da imagem atual.

## Etapa 2 — objeto

Carrega:
- ObjectFocusViewer;
- Three.js se necessário;
- um asset GLB/LOD.

## Etapa 4 — missão

Antes do clique:
- nenhuma scene de missão.

Depois do clique:
- o tour entrega o controle ao SectorHub.

## Regra

Nunca carregar a etapa seguinte apenas porque ela aparece no mini-mapa.
