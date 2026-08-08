# Character Pack G2 — v0.23.0

## Arquivos

```text
assets/characters/g2/
├── manifest.json
├── worker_lod0.glb
├── worker_lod1.glb
├── tst_lod0.glb
└── tst_lod1.glb
```

## Comparação

| Recurso | G1 | G2 |
|---|---:|---:|
| Joints | 7 | 17 |
| Skin | sim | sim |
| AnimationClips | 7 | 7 |
| Antebraço | não separado | separado |
| Mão | não separada | separada |
| Coluna/tórax | único torso | separados |
| Pescoço | não separado | separado |
| Coxa/canela/pé | perna única | separados |
| LOD0/LOD1 | sim | sim |

## Objetivo

G2 melhora articulação mantendo:

- arquivos pequenos;
- geometria low-poly;
- nenhum arquivo de textura externo;
- GitHub Pages;
- fallback para G1 e procedural.

## Worker

Inclui visualmente:

- capacete;
- vestimenta operacional;
- faixa refletiva;
- botas;
- luvas/melhores detalhes no LOD1.

## TST

Inclui:

- capacete;
- roupa diferenciada;
- colete;
- refletivos;
- badge/detalhes no LOD1.

## Clips

### Idle

Movimento sutil de:

- Spine;
- Chest;
- Neck;
- Head.

### Walk

Movimento alternado em:

- braços;
- antebraços;
- coxas;
- canelas;
- pés.

### Inspect

Utiliza:

- Chest;
- Neck;
- Head;
- braço;
- antebraço.

### Reach

Utiliza:

- Chest;
- RightUpperArm;
- RightForeArm;
- Neck.

### Crouch

Utiliza:

- Hips;
- Spine;
- Chest;
- Thighs;
- Shins.

### Seated

Utiliza:

- Hips;
- Spine;
- Thighs;
- Shins;
- Feet.

### Climb

Utiliza braços, antebraços, coxas, canelas e quadril em alternância.

## Escopo

Apesar do esqueleto ampliado, o G2 continua sendo um personagem didático low-poly.

Não deve ser apresentado como:

- mocap;
- animação biomecânica;
- ergonomia medida;
- humano fotorealista.
