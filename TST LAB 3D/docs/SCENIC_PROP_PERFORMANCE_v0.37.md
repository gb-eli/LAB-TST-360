# Performance dos Scenic Props — v0.37.0

## Gate

```text
Eco    0
Medium 0
High   1 tipo
Ultra  2 tipos
```

## Repetição

Props repetíveis podem produzir:
- High: 2 instâncias;
- Ultra: 3 instâncias.

O `InstancedMesh` preserva um drawable para várias ocorrências do mesmo geometry/material.

## Budget

Somente os contextos que usam perfis Construction, Industry, Port, Health, Office, Warehouse, Workshop ou Electrical receberam margem G10.7.

Campus não recebeu margem.

Incêndio/Evacuação também não usa essa camada.

## Asset weight

Os 32 GLBs novos somam aproximadamente 85,6 KB.

A estratégia continua priorizando:
- pequenos arquivos;
- lazy loading;
- LOD;
- instancing;
- ausência de pré-carga.
