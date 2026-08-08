# TST 360 — Arquitetura v0.26.0 / G9.6

## Objetivo

Separar animação ambiental de:

- RiskEngine;
- hotspots;
- evidências;
- objetos focais da missão.

## Camada

```text
ThreeViewport
│
├── Character Population Manager
├── Equipment Motion Controller
└── Ambient Activity Manager
    ├── quality plan
    ├── priority selection
    ├── distance gate
    ├── path motion
    ├── door motion
    ├── oscillation
    ├── rotation
    └── operational lights
```

## Diferença para EquipmentMotion

`EquipmentMotionController` continua indicado para:

- vibração de um equipamento focal;
- rotação local;
- status light diretamente ligada ao equipamento.

`AmbientActivityManager` é voltado a:

- veículos de fundo;
- portas;
- trolley;
- elementos de circulação;
- ciclos ambientais.

## Quality plan

Campos adicionados:

```text
ambientActivityCount
ambientActiveDistance
ambientMotionFactor
```

## Priorização

Cada binding possui `priority`.

Quando o perfil permite somente duas atividades:

```text
todas as bindings
↓
sort priority
↓
top 2
```

As demais permanecem inativas.

## Distance gate

A atividade só executa quando:

```text
profile permite
+
animations != false
+
zona está dentro da distância ativa
```

## Path anchor

Em rotas, a distância é calculada pelo centro geométrico dos waypoints.

Isso evita deadlock de culling.

## Objetos opcionais

`hideWhenInactive:true` permite:

```text
Medium/High/Ultra
→ objeto de fundo aparece

Eco
→ objeto some
```

## Objetos estruturais

Portas não usam hide.

Ao desativar:

```text
door
→ posição fechada/base
```

## Hotspots

Regra G9.6:

```text
objeto que define hotspot
≠
objeto de fundo animado
```

Quando necessário, usa-se clone procedural separado.

## Downloads

Objetos ambientais não devem obrigar segundo carregamento de um asset já usado na cena.

Na v0.26, caminhões, empilhadeiras e carrinhos de fundo reutilizam os fallbacks procedurais.

## Dispose

O manager:

- restaura bindings;
- remove luzes criadas internamente;
- descarta geometrias/materiais das luzes auxiliares;
- encerra referências.

Os objetos pertencentes à cena continuam sendo descartados pelo ciclo normal do viewport.
