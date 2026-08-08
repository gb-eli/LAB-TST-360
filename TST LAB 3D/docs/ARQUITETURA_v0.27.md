# TST 360 — Arquitetura v0.27.0 / G9.7

## Nova camada

```text
ScenarioVariantManager
↓
variant
├── activeRiskIds
├── markerOffsets
└── activityProfile
        ↓
ScenarioActivityDirector
        ├── CharacterPopulationManager
        ├── AmbientActivityManager
        └── EquipmentMotionController
```

## Separação de responsabilidades

`ScenarioVariantManager` continua responsável por:
- selecionar variante;
- rotacionar A/B/C;
- aplicar riscos;
- aplicar offsets.

`ScenarioActivityDirector` cuida apenas do estado ambiental.

Isso evita misturar pontuação de risco com motion visual.

## Perfis

Cada perfil possui:

```text
population
ambient
equipment
distance
channels
```

Canais:

```text
people
traffic
process
doors
lights
```

## Limite superior

O diretor nunca aumenta `populationCount` ou `ambientActivityCount` acima do plano do QualityManager.

O perfil `peak` usa o teto disponível, não cria um novo teto.

## EquipmentMotion

```text
qualityFactor
×
scenarioFactor(channel)
```

Exemplo:

```text
intervention
process = 0
lights = 0.9
```

Resultado:

```text
vibration/rotation → off
status light → pode permanecer
```

## Ambient Activity

```text
qualityPlan
↓
director.ambientPlan()
↓
priority selection
↓
channelFactor(binding.channel)
↓
distance gate
↓
update
```

## Population

```text
qualityPlan
↓
director.populationPlan()
↓
spawn/visibility
```

## Relatórios

O estado ambiental entra na sessão apenas como contexto:

```text
activityProfileId
activityProfileLabel
```

Ele não modifica score nem findings.
