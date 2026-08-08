# TST 360 — Arquitetura v0.24.0 / G9.4

## Objetivo

Melhorar o humanoide sem alterar o skeleton G2 já estabilizado.

## Estratégia

```text
mesmo rig
+
mesmos estados
+
mesma AnimationMixer API
+
geometria melhor
```

Isso reduz risco de regressão.

## Character Pack G2.1

```text
assets/characters/g21/
```

Metadata:

```text
rig: TST360HumanoidG2
jointCount: 17
geometryStyle: rounded-low-poly
```

## Geometry

### G2

Predominância de:

```text
boxes
```

### G2.1

Combina:

```text
ellipsoid sphere
elliptical cylinder
box
```

### Low-poly

O objetivo não é subdivisão alta.

LOD0:
- cilindros com ~8 segmentos;
- esferas com poucos rings.

LOD1:
- cilindros com ~12 segmentos;
- mais rings.

## Fallback

Registry:

```text
g21
  fallbackPack: g2

g2
  fallbackPack: g1

g1
  fallbackPack: null
```

Runtime:

```text
G2.1
↓
G2
↓
G1
↓
procedural
```

## Character Appearance

```text
CharacterController
↓
GLB clone
↓
applyCharacterAppearance()
↓
clone material per mesh
↓
tint clone
```

O source GLTF não é modificado.

## Por que clonar materiais

`SkeletonUtils.clone()` clona a hierarquia/skeleton, mas materiais podem continuar compartilhados.

Sem clone:

```text
worker A material.color = X
→ worker B também muda
```

Com `character-appearance.js`:

```text
worker A
→ material clones A

worker B
→ material clones B
```

## Dispose

`CharacterController.dispose()` agora também elimina os materiais de aparência criados para aquela instância.

## Perfis

```text
standard
warm
deep
cool
```

São apenas parâmetros visuais genéricos.

## Performance

A melhoria de silhueta aumenta triângulos dos personagens, mas ainda permanece baixa quando comparada aos budgets das cenas.

A fase não adiciona:

- textura externa;
- normal map;
- HDRI;
- blendshape;
- facial rig.
