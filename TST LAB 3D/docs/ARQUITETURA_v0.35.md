# Arquitetura v0.35 — G10.5

## Camada nova

```text
ThreeViewport
  ↓ options.visualProfile
ContextualDressingManager
  ↓
SectorVisualProfile
```

A camada é criada apenas quando a cena opta explicitamente.

## Lifecycle
- cria grupo decorativo;
- aplica quantidade pelo QualityManager;
- responde a `quality:changed` via ThreeViewport;
- é removida/disposta junto do viewport.

## Segurança semântica
Todos os objetos da camada recebem:

```text
userData.tstDecorative = true
```

Eles não são registrados como pickables de risco.
