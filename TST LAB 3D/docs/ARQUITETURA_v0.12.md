# TST 360 — Arquitetura v0.12.0 / G8.2

## Objetivo

A v0.12.0 acrescenta uma camada de **inspeção profissional simulada** e um **motor de variações de cenário** sobre a arquitetura existente.

## Fluxo de inspeção

```text
Entrar no laboratório
  ↓
Selecionar variante da sessão
  ↓
Observar 2D/3D
  ↓
Identificar achados
  ↓
Registrar nota de evidência
  ↓
Capturar vista 3D opcional
  ↓
Finalizar sessão
  ↓
Central TST
  ↓
Rascunho de plano de ação
  ↓
Relatório HTML / JSON
```

## InspectionSessionService

Arquivo:

```text
js/tools/inspection-session-service.js
```

Persiste até 60 sessões locais e registra:

- módulo;
- variante;
- visualização;
- início/fim;
- tempo;
- score;
- achados;
- notas de evidência;
- número de capturas;
- controles sugeridos no cenário.

Também gera relatório HTML imprimível.

A captura PNG é baixada pelo navegador e não é embutida no armazenamento local, evitando crescimento excessivo do localStorage.

## ScenarioVariantManager

Arquivo:

```text
js/simulation/scenario-variant-manager.js
```

As variantes são determinísticas e rotacionadas por nova sessão.

Canteiro, Indústria e Eletricidade possuem inicialmente três variantes (A/B/C), com:

- subconjuntos diferentes de riscos ativos;
- contexto de operação diferente;
- deslocamento de hotspots 2D;
- deslocamento de marcadores 3D;
- instruções específicas.

O ID base do risco permanece estável, preservando RiskEngine, Central TST e relatórios.

## Integração 3D

`createInspectionLab()` envia para o renderer:

```js
{
  found,
  activeRiskIds,
  variant,
  onRisk
}
```

Assim o renderer 3D não exibe marcadores de riscos inativos na variante.

## Princípio pedagógico

O relatório é um produto da simulação e não deve ser tratado como inspeção real ou documento oficial. A plataforma ajuda o aluno a estruturar observação, registro e encaminhamento, mas não automatiza a responsabilidade profissional.
