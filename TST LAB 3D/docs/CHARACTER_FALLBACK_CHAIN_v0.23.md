# Character Fallback Chain — v0.23.0

## Objetivo

Permitir evolução visual sem tornar uma atividade dependente do pack mais novo.

## Cadeia padrão

```text
G2
↓
G1
↓
procedural
```

## Cenário 1 — dispositivo normal

```text
Medium/High/Ultra
↓
G2 disponível
↓
kind: gltf
packId: g2
```

## Cenário 2 — G2 ausente/corrompido

```text
G2 falha
↓
G1 carrega
↓
kind: gltf
packId: g1
fallbackReason: asset-pack-fallback
```

## Cenário 3 — G2 e G1 falham

```text
G2 falha
G1 falha
↓
CharacterRig
↓
kind: procedural
fallbackReason: asset-chain-exhausted
```

## Cenário 4 — Eco

```text
skinnedCharacters=false
↓
nenhum GLB é solicitado
↓
CharacterRig
↓
fallbackReason: quality-profile
```

## Diagnóstico

`CharacterController.info()`:

```js
{
  kind,
  packId,
  rig,
  jointCount,
  animationNames,
  fallback,
  fallbackReason
}
```

## Importante

Fallback de pack não é erro pedagógico.

A mesma missão, riscos, evidências e relatório continuam válidos independentemente da fonte visual do personagem.
