# Arquitetura v0.36.0 — G10.6

## Context props

```text
ThreeViewport
↓
visualProfile
├── ContextualDressingManager
└── ContextPropManager
    ↓
ContextPropRegistry
    ↓
AssetManager.acquireFromPack(..., {applyTransform:false})
```

O manager posiciona o objeto no layout periférico da cena, independentemente da transformação originalmente usada pelo pack.

## Lifecycle

1. viewport cria o manager;
2. `applyQuality()` calcula 0/1/2/3 props;
3. assets são adquiridos incrementalmente;
4. queda de qualidade oculta extras;
5. mudança low↔high pode substituir o LOD;
6. dispose libera referências no AssetManager.

## Regras

- não pré-carregar Ultra;
- não adicionar props ao RiskEngine;
- não adicionar props ao array de `pickables`;
- não duplicar arquivos GLB;
- manter objeto principal e riscos pedagogicamente identificáveis.
