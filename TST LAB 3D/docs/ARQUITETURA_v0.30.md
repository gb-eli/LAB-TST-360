# TST 360 — Arquitetura v0.30.0 / G10.0

## Pipeline híbrido

```text
Panorama360Viewer
↓
node.image360?
├── não → renderer procedural
└── sim
    ↓
QualityManager
    ├── Eco → procedural
    └── Medium/High/Ultra
        ↓
dynamic import
EquirectangularPanoramaRuntime
```

## Runtime de imagem

```text
loadThreeRuntime()
↓
Scene
↓
SphereGeometry
↓ scale(-1,1,1)
↓
MeshBasicMaterial(texture)
↓
PerspectiveCamera no centro
```

## Tier

```text
medium
high
ultra
```

A seleção usa o perfil gráfico atual.

## Fallback

```text
Ultra → High → Medium
High  → Medium
Medium → erro
↓
procedural
```

## Hotspots

Node JSON continua sendo a fonte.

```text
x/y
↓
hotspotTransform
↓
u/v
↓
longitude/latitude
↓
Vector3 na esfera
↓
camera.project()
↓
posição DOM
```

Assim a lógica de hotspots permanece separada da textura.

## Eco

O módulo equiretangular nem precisa ser importado.

```text
Eco
↓
Panorama360Viewer
↓
renderer procedural
```

## Troca de qualidade

O runtime escuta:

```text
quality:changed
```

e pode:
- trocar textura;
- reduzir tier;
- voltar ao procedural no Eco.

## Dependências

O panorama procedural continua independente de Three.js.

O equiretangular utiliza Three.js somente após lazy import.

## Assets

```text
assets/panoramas/g10/
```

Não são carregados no boot.

## Regra de substituição

Uma fotografia real deve:
- ser equiretangular;
- manter proporção 2:1;
- ter paths configurados no node;
- respeitar os direitos de uso e privacidade aplicáveis.

A troca não exige modificar o SectorHub.
