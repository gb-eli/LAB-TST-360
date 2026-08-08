# Sector 3D Registry — v0.18.0

## Problema resolvido

Antes, `SectorHub` continha:

- lista de setores 3D;
- imports de todos os renderers;
- labels;
- notas;
- factories.

Isso cresceria a cada setor.

## Solução

Tudo isso foi movido para:

```text
js/sectors/sector-3d-registry.js
```

O hub agora consulta um descriptor.

## Benefícios

- menor acoplamento;
- expansão modular;
- Campus e SectorHub compartilham a mesma fonte;
- facilita adapters para renderers já existentes;
- reduz risco de divergência entre listas.

## Próximos adapters

### Construção

Fonte:

```text
createCanteiro3D
```

### Indústria

Fonte:

```text
createIndustria3D
```

### Obras Elétricas

Fonte:

```text
createEletricidade3D
```

Cada adapter deverá preservar os IDs da missão setorial no `RiskEngine`, mesmo quando reutilizar objetos do laboratório principal.
