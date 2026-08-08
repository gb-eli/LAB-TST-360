# Scenario Activity Director — v0.27.0

## API

```js
const director=createScenarioActivityDirector(context,{
  sectorId:'porto-logistica',
  missionId:'patio-conteineres',
  variant:state.variant
});
```

## Perfis

### routine
Atividade regular, um pouco abaixo do teto gráfico.

### peak
Usa o teto permitido pelo perfil gráfico.

### reorganization
Reduz população, fluxo e processo.

### intervention
Reduz fortemente pessoas/fluxo e zera motion mecânico de processo.

### support
Adequado a apoio/higienização.

### emergency
Reduz processo e tráfego, priorizando portas e luzes.

### reconfiguration
Estado intermediário de rearranjo.

### opening
Estado de abertura/início da atividade.

## Inferência

Se `activityProfile` não existir, o diretor tenta inferir pelo texto da variante.

Depois usa fallback:

```text
A → routine
B → peak
C → reorganization
```

Isso mantém compatibilidade com módulos antigos.

## Override

Uma variante futura pode declarar:

```json
{
  "activityProfile":"routine",
  "activityOverrides":{
    "population":0.6,
    "channels":{
      "traffic":0.4,
      "lights":1
    }
  }
}
```

## Métodos principais

```text
populationPlan(base)
ambientPlan(base)
equipmentFactor(channel)
ambientChannelFactor(channel)
describe()
```

## Evento

Ao criar o diretor:

```text
scenario:activity-profile
```

é emitido no EventBus quando disponível.

## Regra

O diretor controla somente apresentação e atividade contextual.

Ele não cria, remove ou pontua riscos.
