# TST 360 — Arquitetura v0.11.0 / G8.1

## Objetivo da fase

A v0.11.0 transforma métricas de cena em **metas internas de engenharia** e conecta os riscos identificados nos laboratórios à Central TST sem automatizar conclusões profissionais.

## Performance Budget Manager

Arquivos:

```text
js/graphics/performance-budget-manager.js
data/performance/budgets.json
```

Cada laboratório possui metas por perfil gráfico:

- FPS mínimo;
- draw calls máximos;
- triângulos máximos;
- texturas máximas;
- geometrias máximas.

O resultado pode ser:

- `ok`;
- `attention`;
- `over`.

Essas metas servem para desenvolvimento e otimização do TST 360. Não são benchmarks certificados nem requisitos normativos.

## Risk Bridge

Arquivo:

```text
js/tools/risk-bridge.js
```

Fluxo:

```text
Laboratório
   ↓
RiskEngine
   ↓
risk:identified
   ↓
RiskBridge
   ↓
toolkit:risk-inbox
   ↓
Central TST
```

Um risco pode gerar um **rascunho** de:

- matriz de risco;
- inventário;
- APR.

O sistema não salva automaticamente probabilidade, severidade ou documentação final. O estudante precisa revisar os campos antes de registrar.

## Instancing ampliado

O `InstancingManager` já existia no Canteiro.

Na v0.11 também é utilizado em:
- Indústria — caixas/materiais repetidos;
- Eletricidade — delimitadores repetidos no piso.

## Persistência

Novas chaves locais:

```text
toolkit:risk-inbox
performance:last:<module-id>
```

## Princípio

A otimização deve ser medida e a integração pedagógica deve reduzir retrabalho sem retirar do aluno a necessidade de analisar e decidir.
