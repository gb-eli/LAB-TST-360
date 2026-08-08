# Population Performance — v0.25.0

## Objetivo

Controlar três custos diferentes:

```text
download
CPU de animação
GPU de renderização
```

## Download

Eco:

```text
populationCount = 0
```

Nenhum personagem de população é criado.

Médio:

```text
2 procedurais
```

Não precisa baixar Character Pack adicional para a população.

Alto/Ultra:

parte da população pode solicitar Character Pack G2.1.

## CPU

Personagens fora da distância ativa:

```text
pause()
```

Isso interrompe:

- CharacterMotion procedural;
- AnimationMixer GLB.

## GPU

Personagens além da distância de render:

```text
root.visible = false
```

## Quantidade

O manager possui hard cap padrão:

```text
maxCount = 6
```

Uma cena pode reduzir, mas não deve elevar indiscriminadamente sem novo orçamento e validação.

## Budgets

Foram ampliados apenas os contextos que realmente receberam população:

- Indústria;
- missões setoriais de Indústria;
- Porto / Pátio;
- Porto / Doca;
- Saúde / Apoio;
- Saúde / Transporte.

Eco não foi inflado porque população permanece 0.
