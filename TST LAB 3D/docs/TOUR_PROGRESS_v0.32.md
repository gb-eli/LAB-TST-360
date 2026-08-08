# Tour Progress — v0.32.0

## Estrutura

```json
{
  "tourId":"tour-porto-logistica",
  "currentStepId":"segunda-zona",
  "visitedStepIds":["entrada","equipamento","segunda-zona"],
  "startedAt":"...",
  "updatedAt":"...",
  "completedAt":null
}
```

## Regra

`visitedStepIds` é um conjunto lógico.

Revisitar uma etapa não aumenta a contagem.

## Percentual

```text
visited / total × 100
```

## Missão final

A tela de lançamento mantém o progresso anterior.

Somente o clique em:

```text
Abrir missão 3D
```

marca essa etapa como visitada.

## Reset

Remove apenas a chave do tour correspondente.

Não apaga:
- sessões de inspeção;
- Central TST;
- qualidade;
- outros tours.
