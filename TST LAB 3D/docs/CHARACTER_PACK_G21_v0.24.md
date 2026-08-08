# Character Pack G2.1 — v0.24.0

## Objetivo

Melhorar a silhueta do G2 mantendo:

- 17 joints;
- 7 clips;
- LOD0/LOD1;
- fallback;
- baixo peso.

## Arquivos

```text
assets/characters/g21/
├── manifest.json
├── worker_lod0.glb
├── worker_lod1.glb
├── tst_lod0.glb
└── tst_lod1.glb
```

## Geometria

### Cabeça

G2:
- box.

G2.1:
- elipsoide low-poly.

### Braços e pernas

G2:
- prismas retangulares.

G2.1:
- cilindros elípticos low-poly.

### Mãos

G2:
- cubo/box.

G2.1:
- pequeno elipsoide.

### Torso

G2:
- volumes retangulares.

G2.1:
- cilindros elípticos para Spine/Chest.

### Capacete

G2:
- box.

G2.1:
- volume arredondado + aba leve.

## Complexidade aproximada

### Worker

```text
G2 LOD0   ~252 triângulos
G2.1 LOD0 ~740 triângulos

G2 LOD1   ~300
G2.1 LOD1 ~1404
```

### TST

```text
G2 LOD0   ~288
G2.1 LOD0 ~836

G2 LOD1   ~336
G2.1 LOD1 ~1548
```

Mesmo o LOD1 permanece pequeno para uma cena 3D web.

## Skeleton

Não mudou:

```text
TST360HumanoidG2
17 joints
```

## Clips

Não mudou o contrato:

```text
Idle
Walk
Inspect
Reach
Crouch
Seated
Climb
```

Os valores foram suavizados ligeiramente para combinar melhor com a geometria arredondada.
