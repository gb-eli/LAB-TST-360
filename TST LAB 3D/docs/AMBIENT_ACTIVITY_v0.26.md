# Ambient Activity Manager — v0.26.0

## API

```js
const ambient = createAmbientActivity(viewport,{
  maxDistance:30
});
```

## Path

```js
ambient.path(vehicle,[
  [-8,0,5],
  [8,0,5]
],{
  speed:.03,
  priority:10,
  minimum:'medium',
  hideWhenInactive:true
});
```

### Loop

Padrão:

```text
pingpong
```

Também existe:

```text
loop
```

## Door

```js
ambient.door(panel,{
  axis:'x',
  distance:1,
  speed:.12,
  priority:10
});
```

O movimento usa easing `smoothstep`.

## Rotate

```js
ambient.rotate(object,{
  axis:'y',
  speed:.7
});
```

## Oscillate

```js
ambient.oscillate(object,{
  property:'rotation',
  axis:'z',
  amplitude:.08
});
```

## Operational light

```js
ambient.pulseLight(scene,{
  position:[0,3,0],
  color:0xe0ad31
});
```

## Stats

```js
ambient.stats()
```

retorna:

```text
total
active
level
plan
```

## Quality plan padrão

| Perfil | Limite | Distância | Fator |
|---|---:|---:|---:|
| Eco | 0 | 0 | 0 |
| Médio | 2 | 28 | 0.55 |
| Alto | 4 | 38 | 1 |
| Ultra | 6 | 48 | 1.15 |

## Uso pedagógico

A camada existe para dar percepção de ambiente ativo.

Ela não deve controlar:

- hotspot;
- score;
- inventário de riscos;
- laudo;
- procedimento real.
