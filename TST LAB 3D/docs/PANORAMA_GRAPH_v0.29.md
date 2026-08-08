# Panorama Graph — v0.29.0

## Contrato do índice

```json
{
  "defaultNode":"patio",
  "nodes":[
    {
      "id":"patio",
      "title":"Pátio de contêineres",
      "path":"data/environments/porto-logistica/panorama/patio.json"
    }
  ]
}
```

## Contrato do node

```json
{
  "id":"patio",
  "title":"Pátio de contêineres",
  "sceneVariant":"primary",
  "startOffset":1,
  "hotspots":[]
}
```

## Hotspot

```json
{
  "x":28,
  "y":34,
  "label":"Reach stacker",
  "note":"...",
  "category":"object",
  "action":{
    "type":"experience",
    "experienceId":"reachstacker",
    "label":"Abrir objeto 3D"
  }
}
```

## Transição

```json
{
  "category":"node",
  "action":{
    "type":"node",
    "nodeId":"doca"
  }
}
```

## Lazy loading

Ao abrir o panorama do Porto:

```text
panorama/index.json
+
patio.json
```

`doca.json` só entra no cache se a pessoa visitar a doca.

## Crescimento

O grafo pode crescer para:

```text
Pátio
├── Doca
├── Gate
├── CFS
└── Reefer
```

sem alterar o contrato do viewer.
