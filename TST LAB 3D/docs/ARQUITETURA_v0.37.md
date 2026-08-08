# Arquitetura v0.37.0 — G10.7

```text
ThreeViewport
├── ContextualDressingManager
├── ContextPropManager
└── ScenicPropManager
    ↓
ScenicPropRegistry
    ↓
assets/scenery/g107/manifest.json
```

## Separação

- Dressing: geometria procedural mínima.
- Context Props: GLBs já existentes, reutilizados.
- Scenic Props: GLBs novos e exclusivamente cenográficos.

Essa separação reduz ambiguidade entre equipamento pedagógico e decoração.

## Qualidade

Scenic Props:
- Eco 0;
- Medium 0;
- High 1;
- Ultra 2.

## Instancing

Se um prop estiver marcado `repeatable` e possuir um único mesh/material:
- o source GLB é mantido pelo AssetManager;
- o renderer cria `THREE.InstancedMesh`;
- várias ocorrências compartilham geometry/material;
- o source é liberado no dispose.

## LOD

Os GLBs possuem LOD0/LOD1 e são escolhidos pelo AssetManager.

## Lifecycle

O manager é criado pelo ThreeViewport apenas quando existe `visualProfile`.

Se o perfil não tiver configuração G10.7, ele permanece sem conteúdo.
