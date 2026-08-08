# TST 360 — Arquitetura v0.23.0 / G9.3

## Objetivo

Evoluir o humanoide skinned sem eliminar os fallbacks já consolidados.

## Cadeia

```text
CharacterController
↓
characterAsset(role)
↓
G2 descriptor
├── pack
├── id
├── rig
├── jointCount
└── fallbacks[]
      ↓
      G1 descriptor
```

O controller executa:

```text
G2
↓ erro
G1
↓ erro
procedural
```

## Registry

```text
CHARACTER_PACKS
├── g1
│   ├── jointCount: 7
│   └── fallbackPack: null
│
└── g2
    ├── jointCount: 17
    └── fallbackPack: g1
```

## CharacterController

Nova função:

```js
characterAssetCandidates(asset)
```

Responsabilidades:

- incluir o asset principal;
- incluir fallbacks;
- remover duplicatas;
- preservar ordem.

## Source final

`info()` agora informa:

```text
kind
packId
rig
jointCount
fallback
fallbackReason
```

Isso permite saber se a cena está usando:

```text
G2
G1
procedural
```

## Rig G2

```text
17 joints
```

Hierarquia ampliada:

```text
Hips
├── Spine
│   └── Chest
│       ├── Neck → Head
│       ├── LeftUpperArm → LeftForeArm → LeftHand
│       └── RightUpperArm → RightForeArm → RightHand
├── LeftThigh → LeftShin → LeftFoot
└── RightThigh → RightShin → RightFoot
```

## Skin

Cada primitive continua utilizando:

```text
JOINTS_0
WEIGHTS_0
```

No G2 cada peça low-poly é predominantemente ligada ao joint correspondente.

## Clips

Os clips utilizam os joints adicionais.

Exemplo `Walk`:

```text
UpperArm
ForeArm
Thigh
Shin
Foot
Chest
Hips
```

## Performance

Não existe hot-swap entre G2/G1 durante a sessão.

O source é escolhido na abertura.

Isso evita:

- recarregamento do GLB;
- troca de skeleton;
- perda da ação atual;
- salto visual.

## Fallback Eco

Eco interrompe a cadeia antes do primeiro GLB:

```text
skinnedCharacters=false
→ procedural
```

## Cenas G2

Pilotos:

- Indústria;
- Espaço Confinado;
- Oficina;
- Escritório;
- Saúde.

Outras cenas continuam podendo migrar progressivamente.
