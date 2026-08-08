# TST 360 — Arquitetura v0.21.0 / G9.1

## Objetivo

Separar:

```text
"quem é o personagem"
```

de:

```text
"como a cena o anima"
```

e separar:

```text
"qual é o equipamento"
```

de:

```text
"qual motion contextual ele recebe"
```

## CharacterController

```text
Scene
↓
CharacterController
├── Procedural Adapter
│   ├── CharacterRig
│   └── CharacterMotionController
│
└── GLB Adapter
    ├── AssetManager
    ├── SkeletonUtils.clone
    ├── AnimationClip
    └── AnimationMixer
```

A cena usa apenas:

```text
root
setState
setSpeed
update
dispose
```

## Caminho GLB

Novo fluxo:

```text
manifest
↓
AssetManager.acquireAnimatedFromPack()
↓
selectVariant(quality)
↓
GLTFLoader
↓
SkeletonUtils.clone(source.scene)
↓
source.animations
↓
CharacterController
```

`AnimationClip` pode ser compartilhado; cada instância possui seu próprio `AnimationMixer`.

## Fallback

```text
asset GLB configurado
↓
carregou?
├── sim → kind = gltf
└── não → kind = procedural
```

O fallback ocorre no mesmo controller.

## Eco

Quando:

```js
qualityManager.settings.animations === false
```

o CharacterController:

- aplica a postura imediatamente;
- não atualiza ciclos procedurais;
- pausa AnimationMixer;
- preserva a presença do personagem.

## EquipmentMotionController

```text
Scene
↓
EquipmentMotionController
├── rotate
├── vibrate
├── oscillate
└── statusLight
```

O controller é independente do tipo de objeto.

Pode receber:

- Mesh procedural;
- Group;
- clone GLB.

## Níveis

```text
Eco     → motion desativado
Medium  → fator ~0.58
High    → fator 1.0
Ultra   → fator ~1.12
```

## Regra de segurança visual

Movimento de equipamento não deve implicar procedimento operacional quando a missão trata de manutenção ou isolamento.

Por isso a missão `manutencao-maquina` usa:

```text
statusLight
```

e não vibração/operação da máquina.

## Integração inicial

Migrados:

```text
Indústria
Espaço Confinado G5
Oficina / corte
Oficina / manutenção
```

As demais cenas continuam compatíveis com CharacterRig diretamente e podem migrar gradualmente.

## Próxima etapa

Quando existir um asset humano rigged válido:

1. criar pack de personagem;
2. declarar clips;
3. passar `asset` ao CharacterController;
4. manter o mesmo código de cena.
