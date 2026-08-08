# Ambient Activity Performance — v0.26.0

## Custos controlados

A G9.6 controla:

```text
CPU de atualização
GPU de render
luzes dinâmicas
movimento de objetos
```

## Eco

```text
ambientActivityCount = 0
ambientMotionFactor = 0
```

Objetos opcionais configurados com `hideWhenInactive` ficam ocultos.

## Médio

Prioriza normalmente:

- um movimento principal;
- uma segunda atividade contextual.

## Alto/Ultra

Liberam atividades secundárias.

Exemplo Indústria:

```text
Médio
→ empilhadeira + luz

Alto
→ + caixas em rota

Ultra
→ todas as bindings
```

## Sem download duplicado

Veículos de fundo usam clones dos grupos procedurais fallback.

Benefício:

- zero requisição GLB adicional;
- geometrias podem ser compartilhadas;
- menor pressão de rede em GitHub Pages/mobile.

## Luzes

Luzes adicionais são limitadas pelo próprio `ambientActivityCount`.

Quando inativas:

```text
intensity = 0
```

## Budgets

Foram recalibrados apenas contextos que receberam G9.6:

- Indústria;
- missões setoriais de Indústria;
- Porto/Pátio;
- Porto/Doca;
- Saúde/Apoio;
- Saúde/Transporte.

Eco não foi ampliado.
