# Character Controller — v0.21.0

## API

```js
const controller = await createCharacterController(viewport, options);
```

### Options principais

```js
{
  x,
  y,
  z,
  rotationY,
  scale,
  initial,
  speed,
  helmet,
  vest,
  asset,
  clipAliases
}
```

## Procedural

Sem `asset`:

```text
CharacterRig
+
CharacterMotionController
```

## GLB animado

Com:

```js
asset:{
  pack:'assets/characters/.../manifest.json',
  id:'worker'
}
```

o controller tenta carregar:

```text
root
animations[]
animationNames[]
```

## Convenção de clips

Aliases padrão:

```text
idle    → idle, stand, standing, breathing
walk    → walk, walking, locomotion
inspect → inspect, inspection, look, observe, idle
reach   → reach, reaching, grab, pickup
crouch  → crouch, crouching, squat
seated  → sit, sitting, seated
climb   → climb, climbing, ladder
```

O nome do clip não precisa ser idêntico.

## Métodos

```text
setState()
setSpeed()
setHelmet()
setVest()
pause()
resume()
update()
info()
dispose()
```

## info()

Exemplo atual:

```json
{
  "kind":"procedural",
  "state":"inspect",
  "speed":1,
  "animationNames":[],
  "fallback":false
}
```

Um futuro personagem GLB retornará:

```text
kind = gltf
```

## Política de fallback

Um personagem nunca deve impedir o laboratório de funcionar.

```text
GLB rigged
↓
erro de rede / asset / clip
↓
procedural CharacterRig
```
