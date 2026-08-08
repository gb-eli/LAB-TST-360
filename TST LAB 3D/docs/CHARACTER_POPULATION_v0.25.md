# Character Population Manager — v0.25.0

## API

```js
const population = await createCharacterPopulation(
  viewport,
  specs,
  options
);
```

## Perfil padrão

| Qualidade | Pessoas | Skinned | Distância ativa |
|---|---:|---:|---:|
| Eco | 0 | 0 | 0 |
| Médio | 2 | 0 | 11 |
| Alto | 4 | até 2 | 16 |
| Ultra | 6 | até 3 | 22 |

## Spec

```js
{
  x:0,
  y:0,
  z:0,
  role:'worker',
  state:'walk',
  rotationY:0,
  scale:.82,
  helmet:true,
  vest:false,
  appearance:'warm',
  patrol:{
    axis:'x',
    amplitude:.5,
    speed:.3
  }
}
```

## Aparência automática

Se `appearance` não for informada:

```text
standard / warm / deep / cool
```

são distribuídas deterministicamente.

## Motion

A population não possui navmesh.

A patrulha é propositalmente simples:

```text
sin(elapsed × speed)
```

com deslocamento em um único eixo.

Isso atende ao objetivo visual sem adicionar pathfinding.

## Pausa

Entradas fora da área ativa recebem:

```text
controller.pause()
```

Ao retornar:

```text
controller.resume()
```

## Expansão

`ensureCount()` possui proteção de expansão concorrente.

Não são disparadas múltiplas filas simultâneas de criação.

## Stats

```js
population.stats()
```

retorna:

```text
created
visible
active
skinned
procedural
level
```

## Limites

A população:

- não é simulação de produtividade;
- não é cálculo de lotação;
- não representa dimensionamento de equipe;
- não determina risco por quantidade de trabalhadores.
