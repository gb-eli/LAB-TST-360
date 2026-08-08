# TST 360 — Arquitetura v0.25.0 / G9.5

## Objetivo

Adicionar sensação de ambiente ocupado sem transformar cada cena em uma coleção irrestrita de `AnimationMixer`.

## Camadas

```text
ThreeViewport
│
├── personagens principais
│   └── CharacterController
│
└── CharacterPopulationManager
    ├── quality plan
    ├── spawn incremental
    ├── source mix
    ├── appearance
    ├── distance culling
    ├── animation pause
    └── patrol motion
```

## Quality plan

Fonte principal:

```text
QualityManager.settings
```

Campos:

```text
populationCount
skinnedPopulation
populationActiveDistance
```

O manager também aceita overrides por cena.

## Spawn

`init(specs)` recebe uma lista de posições/estados.

Exemplo:

```js
[
  {
    x:-4,
    z:3,
    state:'walk',
    patrol:{
      axis:'x',
      amplitude:.7
    }
  }
]
```

## Source mix

Para cada novo personagem:

```text
currentSkinned < skinnedLimit?
├── sim → characterAsset(role)
└── não → procedural
```

Como `characterAsset()` usa o registry atual, o source skinned segue:

```text
G2.1 → G2 → G1 → procedural
```

## Qualidade crescente

O manager não pré-carrega a capacidade Ultra.

Exemplo:

```text
abre em Medium
→ cria 2

troca para High
→ ensureCount()
→ cria somente +2
```

Isso evita baixar pessoas ocultas antecipadamente.

## Qualidade decrescente

Os objetos já criados são preservados para permitir retorno rápido ao perfil superior.

Entretanto:

```text
index >= desiredCount
→ visible = false
→ controller.pause()
```

## Distance culling

Para cada entrada:

```text
distance <= activeDistance
→ visível + animada

activeDistance < distance <= renderDistance
→ visível + pausada

distance > renderDistance
→ oculta + pausada
```

## Render distance

```text
min(
  sceneHiddenDistance,
  activeDistance + renderMargin
)
```

`renderMargin` padrão:

```text
6
```

## CPU × GPU

Pausar animação reduz CPU.

Ocultar o root reduz também o custo de renderização daquela entrada.

As duas operações são diferentes e são usadas em conjunto.

## Determinismo

O manager usa seed para:

- seleção de aparência;
- pequenas variações de velocidade;
- phase.

Assim a população não muda aleatoriamente a cada frame.

## Dispose

Todos os CharacterControllers criados pelo manager são descartados junto com a cena.

## Pilotos

```text
Indústria
Porto / Pátio
Porto / Doca
Saúde / Apoio
Saúde / Transporte
```

## Segurança arquitetural

A população não participa do RiskEngine como risco independente.

Ela é contexto visual.

Hotspots, evidências e relatórios continuam sendo definidos pelas missões.
