# TST 360 — Arquitetura v0.22.0 / G9.2

## Objetivo

Validar ponta a ponta um personagem GLB com:

- SkinnedMesh;
- skeleton;
- skin weights;
- AnimationClips;
- AnimationMixer;
- LOD;
- fallback procedural.

## Camadas

```text
Scene
↓
characterAsset(role)
↓
Character Pack Registry
↓
CharacterController
├── Quality gate
├── AssetManager
│   ├── GLTFLoader
│   ├── SkeletonUtils
│   └── AnimationClips
├── AnimationMixer
└── fallback CharacterRig
```

## Registry

```text
data/characters/packs.json
js/graphics/character-pack-registry.js
```

A cena pede apenas:

```js
characterAsset('worker')
```

ou:

```js
characterAsset('tst')
```

## Quality gate

Antes de tentar o GLB:

```js
qualityManager.settings.skinnedCharacters
```

### Eco

```text
false
→ procedural
```

### Médio/Alto/Ultra

```text
true
→ tentar GLB
```

Isso reduz carregamento e custo de skinning no perfil de menor capacidade.

## LOD

O manifest do pack escolhe:

```text
eco/medium → lod0
high/ultra → lod1
```

Como Eco atualmente não tenta SkinnedMesh, `lod0` fica principalmente para Médio e como opção de compatibilidade futura.

## Skin

Rig:

```text
Hips
├── Torso
│   ├── Head
│   ├── LeftArm
│   └── RightArm
├── LeftLeg
└── RightLeg
```

O mesh possui:

```text
POSITION
NORMAL
JOINTS_0
WEIGHTS_0
indices
```

A skin possui `inverseBindMatrices`.

## Animações

Os AnimationClips são carregados do `source.animations` original do GLTF.

O clone visual continua sendo produzido por:

```text
SkeletonUtils.clone(source.scene)
```

O controller cria um `AnimationMixer` por instância.

Isso permite múltiplos personagens usando os mesmos clips sem compartilhar estado de reprodução.

## Fallback

Falhas possíveis:

```text
perfil Eco
asset ausente
manifest inválido
GLTFLoader falha
```

Todas convergem para:

```text
CharacterRig procedural
```

## Eventos

```text
character:source
character:fallback
```

Podem alimentar diagnóstico, telemetria local ou painel técnico futuro.

## Limite

O G1 é um rig reduzido de validação técnica. Não possui:

- dedos;
- mãos articuladas;
- joelhos independentes;
- IK;
- facial rig;
- mocap;
- blendshapes;
- PBR humano detalhado.
