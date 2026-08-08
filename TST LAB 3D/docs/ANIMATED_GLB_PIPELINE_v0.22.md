# Pipeline GLB Animado — v0.22.0

## Carregamento

```text
CharacterController.init()
↓
skinnedCharacters?
├── não → CharacterRig
└── sim
    ↓
AssetManager.acquireAnimatedFromPack()
    ↓
selectVariant(quality)
    ↓
AssetManager.acquireAnimated()
    ↓
GLTFLoader
    ↓
SkeletonUtils.clone()
    ↓
AnimationClip[]
```

## Reprodução

```text
AnimationMixer(root)
↓
resolveCharacterClip()
↓
mixer.clipAction(clip)
↓
fadeOut / fadeIn
↓
play
```

## Alias

O manifest pode declarar:

```json
{
  "clipAliases":{
    "walk":"Walk",
    "inspect":"Inspect"
  }
}
```

O resolver aceita string ou lista.

## Instâncias

Cada clone possui:

- root próprio;
- skeleton próprio via SkeletonUtils;
- AnimationMixer próprio;
- ações próprias.

Os AnimationClips podem ser compartilhados porque são dados imutáveis de animação.

## Release

```text
CharacterController.dispose()
↓
mixer.stopAllAction()
↓
mixer.uncacheRoot()
↓
AssetManager.release(root)
```

## Decisão de qualidade

A fonte GLB/procedural é escolhida na abertura da cena.

Trocas posteriores de qualidade controlam:

- mixer on/off;
- shadows;
- materiais;
- efeitos.

Elas não fazem hot-swap de personagem no meio da sessão, evitando saltos visuais, reloads e perda de estado.
